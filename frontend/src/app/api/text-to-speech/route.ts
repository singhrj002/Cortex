import { NextRequest, NextResponse } from 'next/server';

// Rachel voice ID — ElevenLabs
const RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${RACHEL_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.20,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('ElevenLabs error:', err);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${res.status}` },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
