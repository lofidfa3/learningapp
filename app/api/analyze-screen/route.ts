import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback or error if no key.
      // We will allow it to fail gracefully or use OpenAI if OpenRouter is missing,
      // but for this task we assume OpenRouter is the goal.
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not set' },
        { status: 500 }
      );
    }

    const { image } = await req.json(); // Expecting base64 string without data prefix

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Using Google Gemini Pro 2.0 via OpenRouter for high precision vision (free)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:3000', // Required by OpenRouter
        'X-Title': 'Desktop Voice Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-pro-exp-02-05:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this screenshot of my computer desktop. Briefly describe the most important active window, code, or content you see so I can talk to you about it. Be concise (under 30 words).'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("OpenRouter error:", err);
        return NextResponse.json({ error: 'OpenRouter API failed' }, { status: response.status });
    }

    const data = await response.json();

    // Safety check for response format
    const description = data.choices?.[0]?.message?.content || "I can't see the screen clearly right now.";

    return NextResponse.json({ description });

  } catch (error) {
    console.error('Error analyzing screen:', error);
    return NextResponse.json(
      { error: 'Failed to analyze screen' },
      { status: 500 }
    );
  }
}
