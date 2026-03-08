import "dotenv/config";
import express from "express";
import cors from "cors";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { GoogleGenAI } from "@google/genai";
import { MongoClient } from "mongodb";
import {
  createUser,
  verifyUser,
  signToken,
  verifyToken,
} from "./auth.js";

const app = express();
const PORT = process.env.PORT || 8001;

const CHAT_SYSTEM_PROMPT = `You are a helpful assistant for StraitWatch...`;

// —— MongoDB Setup ——
const MONGO_URI = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017/";
const mongoClient = new MongoClient(MONGO_URI);
let db;
mongoClient.connect().then(() => {
  db = mongoClient.db("straitwatch_data");
  console.log("Connected to MongoDB - straitwatch_data");
}).catch(console.error);

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
    const ai = new GoogleGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content ?? "" }],
    }));

    // Prepend system prompt if needed, but Gemini 1.5 prefers it via model config or as first user message. 
    // Here we stick to adding it to contents for simplicity if the library supports it, or just use it as instruction.
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: CHAT_SYSTEM_PROMPT }] },
        ...contents,
      ],
    });

    const response = await result.response;
    const text = response.text();
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

// —— Data Endpoints ——

app.get("/api/events", async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    const newsCollection = db.collection("news");
    
    // Fetch latest 3 events from year 2026
    const docs = await newsCollection
      .find({ year: 2026 })
      .sort({ eventDate: -1, _id: -1 })
      .limit(3)
      .toArray();

    const events = docs.map((doc) => {
      const dateObj = new Date(doc.eventDate);
      const timeStr = isNaN(dateObj.getTime()) ? "00:00" : `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      
      let severityLabel = "Low";
      if (doc.severityScore >= 66) severityLabel = "High";
      else if (doc.severityScore >= 33) severityLabel = "Med.";

      let text = doc.headline || doc.title || "";
      // The original mock titles have things like "2025 Incident" or "2001 Incident".
      // Let's replace the year with 2026 to avoid confusion since the eventDate is 2026.
      text = text.replace(/\b20\d{2}\b/g, "2026");

      return {
        id: doc._id.toString(),
        time: timeStr,
        text: text,
        severity: severityLabel,
        predictedOilMove: doc.modelPredictedOilMovePct || 0,
      };
    });

    // Mock chart data for now, as it's not part of the model scope
    const activityChart = [
      { time: "12:00", value: 45 },
      { time: "13:00", value: 52 },
      { time: "14:00", value: 48 },
      { time: "15:00", value: 58 },
      { time: "16:00", value: 55 },
      { time: "17:00", value: 62 },
      { time: "18:00", value: 68 },
    ];

    res.json({ events, activityChart });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/api/crisis/briefing", async (req, res) => {
  // Mock briefing for now
  const briefing = {
    event: "Tanker Security Incident",
    riskScore: 82,
    predictedImpact: {
      oilPriceChange: "+3.4%",
      supplyChainDisruption: "Moderate",
    },
    topFactors: [
      "Multiple Tanker Reroutes",
      "Surge in News Reports",
      "Military Activity Detected",
    ],
  };
  res.json(briefing);
});

app.get("/api/shipping/status", async (req, res) => {
  const status = {
    status: "Normal Operations",
    lastUpdated: new Date().toISOString(),
    vesselsCount: 142,
    incidentsLast24h: 0,
  };
  res.json(status);
});

app.get("/api/charts/risk-oil", async (req, res) => {
  const data = [
    { date: "2026-03-01", risk: 20, oil: 78.5 },
    { date: "2026-03-02", risk: 25, oil: 79.2 },
    { date: "2026-03-03", risk: 45, oil: 82.5 },
    { date: "2026-03-04", risk: 40, oil: 81.8 },
    { date: "2026-03-05", risk: 65, oil: 86.4 },
    { date: "2026-03-06", risk: 82, oil: 89.2 },
    { date: "2026-03-07", risk: 78, oil: 88.5 },
  ];
  res.json({ trend: data });
});

app.get("/api/map/data", async (req, res) => {
  res.json({ markers: [] });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
