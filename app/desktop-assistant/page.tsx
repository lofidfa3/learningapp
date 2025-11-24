'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRealtimeAssistant } from '@/components/useRealtimeAssistant';
import { Mic, MicOff, Monitor, MonitorOff, Activity, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DesktopAssistantPage() {
  const { connect, disconnect, startScreenShare, stopScreenShare, state } = useRealtimeAssistant();
  const [showDebug, setShowDebug] = useState(false);

  // Auto-scroll for debug logs if we implemented them, currently placeholder
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-neutral-800">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-light tracking-tight">Desktop Companion</h1>
            <p className="text-neutral-400 text-sm">Real-time voice & vision assistant powered by OpenAI & Gemini</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={state.isConnected ? "default" : "outline"} className={state.isConnected ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0" : "text-neutral-500 border-neutral-800"}>
              {state.isConnected ? 'Connected' : 'Offline'}
            </Badge>
            {state.isSharingScreen && (
               <Badge variant="default" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0">
                 Viewing Screen
               </Badge>
            )}
          </div>
        </header>

        {/* Main Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Visualizer / Status Area */}
          <Card className="bg-neutral-900/50 border-neutral-800 h-[300px] flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 transition-opacity duration-1000 ${state.isConnected ? 'opacity-100' : 'opacity-20'}`} />

            {/* The Orb / Visualizer */}
            <div className="relative z-10 flex flex-col items-center gap-6">
               <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${state.isConnected ? 'bg-neutral-100 shadow-[0_0_60px_-10px_rgba(255,255,255,0.3)] scale-100' : 'bg-neutral-800 scale-90'}`}>
                  {state.isConnected ? (
                    <div className="animate-pulse w-full h-full rounded-full bg-gradient-to-tr from-indigo-300 to-emerald-200 opacity-80 blur-xl" />
                  ) : (
                    <MicOff className="w-8 h-8 text-neutral-600" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                     {state.isConnected && <Activity className="w-10 h-10 text-neutral-900 animate-bounce" />}
                  </div>
               </div>

               <p className="text-neutral-400 font-medium tracking-wide text-sm uppercase">
                 {state.isConnected ? (state.isListening ? "Listening..." : "Processing") : "Ready to Connect"}
               </p>
            </div>
          </Card>

          {/* Controls & Preview */}
          <div className="space-y-6 flex flex-col">
            <Card className="bg-neutral-900/50 border-neutral-800 flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
                <CardDescription>Manage your session and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="flex gap-3">
                  {!state.isConnected ? (
                    <Button
                      onClick={connect}
                      className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200 transition-colors"
                      size="lg"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Start Conversation
                    </Button>
                  ) : (
                    <Button
                      onClick={disconnect}
                      variant="destructive"
                      className="w-full bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/50"
                      size="lg"
                    >
                      <MicOff className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                   <Button
                     onClick={state.isSharingScreen ? stopScreenShare : startScreenShare}
                     disabled={!state.isConnected}
                     variant="outline"
                     className={`w-full border-neutral-800 hover:bg-neutral-800 ${state.isSharingScreen ? 'text-blue-400 bg-blue-900/10 border-blue-900/50' : 'text-neutral-300'}`}
                   >
                     {state.isSharingScreen ? (
                       <><MonitorOff className="w-4 h-4 mr-2" /> Stop Viewing</>
                     ) : (
                       <><Monitor className="w-4 h-4 mr-2" /> Share Screen</>
                     )}
                   </Button>
                </div>

              </CardContent>
            </Card>

            {/* Error Display */}
            {state.error && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm">
                Error: {state.error}
              </div>
            )}
          </div>
        </div>

        {/* Helper Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-neutral-500 text-sm">
           <div className="p-4 rounded border border-neutral-800 bg-neutral-900/30">
             <strong className="block text-neutral-300 mb-1">1. Connect</strong>
             Click "Start Conversation" to begin the voice session with the AI.
           </div>
           <div className="p-4 rounded border border-neutral-800 bg-neutral-900/30">
             <strong className="block text-neutral-300 mb-1">2. Share</strong>
             Enable "Share Screen" so the AI can see what you are working on.
           </div>
           <div className="p-4 rounded border border-neutral-800 bg-neutral-900/30">
             <strong className="block text-neutral-300 mb-1">3. Interact</strong>
             Talk naturally. The AI sees your screen every few seconds and will react.
           </div>
        </div>

      </div>
    </div>
  );
}
