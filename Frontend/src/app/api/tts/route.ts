import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  let body: { text?: string; voiceId?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim();
  const voiceId = body.voiceId || defaultVoiceId;

  if (!text) {
    return NextResponse.json({ error: "Provide a non-empty text string." }, { status: 400 });
  }

  if (!voiceId) {
    return NextResponse.json(
      { error: "ElevenLabs voice ID not configured. Set ELEVENLABS_VOICE_ID in .env.local or pass voiceId." },
      { status: 503 }
    );
  }

  try {
    const elevenlabs = new ElevenLabsClient({ apiKey });

    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request to ElevenLabs failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

