'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Types for the Realtime API events (simplified)
type SessionConfig = {
  modalities: string[];
  voice: string;
  instructions: string;
};

export interface AssistantState {
  isConnected: boolean;
  isListening: boolean;
  isSharingScreen: boolean;
  error: string | null;
}

export function useRealtimeAssistant() {
  const [state, setState] = useState<AssistantState>({
    isConnected: false,
    isListening: false,
    isSharingScreen: false,
    error: null,
  });

  const [items, setItems] = useState<any[]>([]);

  // Refs for managing connection and media
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Connection cleanup
  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false, isListening: false, isSharingScreen: false }));
  }, []);

  // Initialize WebRTC session
  const connect = useCallback(async () => {
    try {
      // Get ephemeral token
      const tokenResponse = await fetch('/api/realtime-session');
      const data = await tokenResponse.json();

      if (!data.client_secret?.value) {
        throw new Error('Failed to get ephemeral token');
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      // Create Peer Connection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Set up remote audio
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      // Add local microphone
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      mediaStreamRef.current = ms;
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.addEventListener('message', (e) => {
        // Handle server events
        const event = JSON.parse(e.data);
        console.log('Server event:', event.type, event);

        if (event.type === 'conversation.item.created') {
            setItems(prev => [...prev, event.item]);
        }
      });

      // Start the session (SDP offer/answer)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      const answerSdp = await sdpResponse.text();
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: answerSdp,
      };

      await pc.setRemoteDescription(answer);

      setState(prev => ({ ...prev, isConnected: true, isListening: true }));

      // Set initial instructions once connected
      // We need to wait for the data channel to be open, but typically SDP exchange handles the connection.
      // Better to send instructions via session update event when DC is open.

      dc.onopen = () => {
          const updateEvent = {
              type: 'session.update',
              session: {
                  instructions: "You are a helpful, witty, and extremely capable desktop voice assistant. You can see the user's screen. Provide human-like, concise, and useful reactions. If the user shows you code, analyze it. If they show you a website, comment on the design or content. Be friendly and professional."
              }
          };
          dc.send(JSON.stringify(updateEvent));
      };


    } catch (err: any) {
      console.error('Connection error:', err);
      setState(prev => ({ ...prev, error: err.message }));
      cleanup();
    }
  }, [cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Screen Sharing Logic
  const startScreenShare = useCallback(async () => {
    try {
      if (!dcRef.current || dcRef.current.readyState !== 'open') {
         throw new Error("Connection not ready");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setState(prev => ({ ...prev, isSharingScreen: true }));

      // Initialize off-screen video/canvas for capturing frames
      if (!videoElementRef.current) {
        videoElementRef.current = document.createElement('video');
      }
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      videoElementRef.current.srcObject = stream;
      videoElementRef.current.play();

      // Start frame capture loop
      const captureInterval = setInterval(() => {
        if (!state.isSharingScreen && !screenStreamRef.current?.active) {
            clearInterval(captureInterval);
            return;
        }
        captureAndSendFrame();
      }, 3000); // Capture every 3 seconds

      // Handle user stopping share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        clearInterval(captureInterval);
        setState(prev => ({ ...prev, isSharingScreen: false }));
        screenStreamRef.current = null;
      };

    } catch (err) {
      console.error('Screen share error:', err);
    }
  }, [state.isSharingScreen]); // Careful with deps

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setState(prev => ({ ...prev, isSharingScreen: false }));
    }
  }, []);

  const captureAndSendFrame = () => {
    const video = videoElementRef.current;
    const canvas = canvasRef.current;
    const dc = dcRef.current;

    if (!video || !canvas || !dc || dc.readyState !== 'open') return;

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get base64 jpeg
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

        // Strategy: Proxy Vision
        // Since I cannot call standard API from client safely with the key, I should send the image to my OWN backend,
        // which analyzes it and returns text, then I send that text to the Realtime API.
        analyzeScreenFrame(base64);
    }
  };

  const analyzeScreenFrame = async (base64Image: string) => {
      // We will create a new API route for this: /api/analyze-screen
      try {
          const res = await fetch('/api/analyze-screen', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ image: base64Image })
          });
          const data = await res.json();
          if (data.description) {
              const event = {
                  type: 'conversation.item.created',
                  item: {
                      type: 'message',
                      role: 'user',
                      content: [
                          { type: 'input_text', text: `[SYSTEM: The user is sharing their screen. Here is a description of what is visible: ${data.description}]` }
                      ]
                  }
              };
              dcRef.current?.send(JSON.stringify(event));

              // Trigger a response if needed, or let the model decide to speak
              dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
          }
      } catch (e) {
          console.error("Vision analysis failed", e);
      }
  };

  return {
    connect,
    disconnect,
    startScreenShare,
    stopScreenShare,
    state
  };
}
