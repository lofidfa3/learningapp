import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint
export async function GET() {
  return NextResponse.json({
    message: 'AI Simple Test endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'AI Simple Test POST endpoint is working',
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
