import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const systemPrompt = `You are a helpful assistant for StraitWatch, a crisis intelligence system for maritime activities and the Strait of Hormuz. You help users understand risk, events, shipping status, and regional developments. Be concise and factual.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured. Set GEMINI_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty messages array with role and content." },
      { status: 400 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    ...messages.map((m: { role: string; content: string }) => ({
      role: (m.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: m.content }],
    })),
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
    });

    const text = response.text ?? "";
    return NextResponse.json({ content: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
