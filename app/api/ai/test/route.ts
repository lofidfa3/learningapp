import { NextRequest, NextResponse } from 'next/server';

// Test endpoint for AI functionality
export async function GET() {
  return NextResponse.json({
    message: 'AI Test endpoint is working',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/api/ai/chat - Chat with AI about articles',
      '/api/ai/free - Free AI alternative',
      '/api/ai/debug - Debug Gemini API',
      '/api/ai/simple-test - Simple test endpoint'
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'AI Test POST endpoint is working',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }
}
