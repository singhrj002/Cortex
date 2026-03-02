import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OPENAI_API_KEY not found in environment',
        hasKey: false
      }, { status: 500 });
    }

    // Check if API key format is valid
    const keyPreview = process.env.OPENAI_API_KEY.substring(0, 10) + '...';

    // Try to create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Try a simple API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "test successful"' }],
      max_tokens: 10,
    });

    return NextResponse.json({
      success: true,
      keyPreview,
      response: completion.choices[0].message.content
    });

  } catch (error: any) {
    console.error('OpenAI Test Error:', error);
    return NextResponse.json({
      error: error.message,
      code: error.code,
      type: error.type,
      hasKey: !!process.env.OPENAI_API_KEY
    }, { status: 500 });
  }
}
