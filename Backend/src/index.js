import "dotenv/config";
import express from "express";
import cors from "cors";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { GoogleGenAI } from "@google/genai";
import {
  createUser,
  verifyUser,
  signToken,
  verifyToken,
} from "./auth.js";

const app = express();
const PORT = process.env.PORT || 8001;

const CHAT_SYSTEM_PROMPT = `You are a helpful assistant for StraitWatch, a crisis intelligence system for maritime activities and the Strait of Hormuz. You help users understand risk, events, shipping status, and regional developments. Be concise and factual.`;

app.use(cors({ origin: true }));
app.use(express.json());

// —— Auth ——

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name, country } = req.body ?? {};
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: "Email, password, and name are required.",
    });
  }
  const result = await createUser({ email, password, name, country });
  if (result.error) {
    return res.status(400).json({ success: false, error: result.error });
  }
  const token = signToken(result.user);
  return res.json({
    success: true,
    user: result.user,
    token,
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required.",
    });
  }
  const result = await verifyUser(email, password);
  if (result.error) {
    return res.status(401).json({ success: false, error: result.error });
  }
  const token = signToken(result.user);
  return res.json({
    success: true,
    user: result.user,
    token,
  });
});

app.post("/api/auth/logout", (_req, res) => {
  res.json({ success: true });
});

app.get("/api/auth/session", (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  return res.json({ user });
});

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Gemini API key not configured. Set GEMINI_API_KEY in .env.",
    });
  }

  const messages = req.body?.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "Provide a non-empty messages array with role and content.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contents = [
      { role: "user", parts: [{ text: CHAT_SYSTEM_PROMPT }] },
      ...messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content ?? "" }],
      })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const text = response.text ?? "";
    return res.json({ content: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini request failed";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/tts", async (req, res) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey) {
    return res.status(503).json({
      error: "ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in .env.",
    });
  }

  const text = req.body?.text?.trim();
  const voiceId = req.body?.voiceId || defaultVoiceId;

  if (!text) {
    return res.status(400).json({ error: "Provide a non-empty text string." });
  }

  if (!voiceId) {
    return res.status(503).json({
      error:
        "ElevenLabs voice ID not configured. Set ELEVENLABS_VOICE_ID in .env or pass voiceId.",
    });
  }

  try {
    const elevenlabs = new ElevenLabsClient({ apiKey });
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    const chunks = [];
    const reader = audioStream.getReader();
    let done = false;
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);

    res.set({
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    });
    res.send(buffer);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Request to ElevenLabs failed";
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
