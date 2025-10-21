import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to debug Gemini API issues
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Simple test request
    const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "Hello, this is a test response"'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.3
        }
      })
    });

    console.log('Test response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('Test API error:', testResponse.status, errorText);
      return NextResponse.json(
        { 
          error: `Test failed with status ${testResponse.status}`,
          details: errorText
        },
        { status: testResponse.status }
      );
    }

    const testData = await testResponse.json();
    console.log('Test API response:', JSON.stringify(testData, null, 2));
    
    if (!testData.candidates || !testData.candidates[0]) {
      return NextResponse.json(
        { error: 'No candidates in response', response: testData },
        { status: 500 }
      );
    }

    const candidate = testData.candidates[0];
    
    if (candidate.finishReason === 'SAFETY') {
      return NextResponse.json(
        { error: 'Content blocked by safety filters', candidate },
        { status: 400 }
      );
    }
    
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
      return NextResponse.json(
        { error: 'Invalid candidate structure', candidate },
        { status: 500 }
      );
    }

    const response = candidate.content.parts[0].text;

    return NextResponse.json({
      success: true,
      response,
      candidate,
      fullResponse: testData
    });

  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
