import "dotenv/config";
import express from "express";
import cors from "cors";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient, ObjectId } from "mongodb";
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

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: "Invalid or expired token" });
  req.user = user;
  next();
}

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
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const contents = messages.map((m) => m.content ?? "").join("\n\n");
    const fullPrompt = `${CHAT_SYSTEM_PROMPT}\n\n${contents}`;

    const result = await model.generateContent(fullPrompt);
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
      // Show just the time (HH:MM) for events
      const timeStr = isNaN(dateObj.getTime()) ? "00:00" : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      let severityLabel = "Low";
      if (doc.severityScore >= 66) severityLabel = "High";
      else if (doc.severityScore >= 33) severityLabel = "Med.";

      let text = doc.headline || doc.title || "";
      // Remove year references from event text (e.g., "2025 Incident" -> "Incident")
      text = text.replace(/\b20\d{2}\s+/g, "");

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
  try {
    if (!db) throw new Error("Database not connected");
    const newsCollection = db.collection("news");
    
    // Fetch latest high-severity events from 2026
    const recentEvents = await newsCollection
      .find({ 
        year: 2026,
        severityScore: { $gte: 50 } // High severity events
      })
      .sort({ eventDate: -1, _id: -1 })
      .limit(5)
      .toArray();

    if (!recentEvents || recentEvents.length === 0) {
      // Fallback to mock data if no events found
      return res.json({
        event: "No Recent Critical Events",
        riskScore: 15,
        predictedImpact: {
          oilPriceChange: "+0.1%",
          supplyChainDisruption: "Minimal",
        },
        topFactors: [
          "Normal Operations",
          "Stable Market Conditions",
          "No Major Disruptions Detected",
        ],
      });
    }

    // Calculate aggregate risk score (average of severity scores)
    const avgSeverity = recentEvents.reduce((acc, evt) => acc + (evt.severityScore || 0), 0) / recentEvents.length;
    const riskScore = Math.round(avgSeverity);

    // Calculate predicted oil price change (sum of model predictions)
    const totalOilImpact = recentEvents.reduce((acc, evt) => acc + (evt.modelPredictedOilMovePct || 0), 0);
    const oilPriceChange = totalOilImpact >= 0 
      ? `+${totalOilImpact.toFixed(1)}%` 
      : `${totalOilImpact.toFixed(1)}%`;

    // Determine supply chain disruption level
    let supplyChainDisruption = "Minimal";
    if (avgSeverity >= 75) supplyChainDisruption = "Severe";
    else if (avgSeverity >= 50) supplyChainDisruption = "Moderate";
    else if (avgSeverity >= 33) supplyChainDisruption = "Minor";

    // Use Gemini to generate intelligent analysis
    const apiKey = process.env.GEMINI_API_KEY;
    let topFactors = [
      "Multiple high-severity events detected",
      "Elevated regional tensions",
      "Supply chain vulnerabilities identified",
    ];
    let eventSummary = recentEvents[0]?.headline || "Multiple Regional Incidents";

    if (apiKey) {
      try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const eventDetails = recentEvents.map((evt, idx) => 
          `${idx + 1}. ${evt.headline || evt.title} (Severity: ${evt.severityScore}, Predicted Oil Impact: ${(evt.modelPredictedOilMovePct || 0).toFixed(1)}%)`
        ).join('\n');

        const prompt = `You are a geopolitical risk analyst for oil markets. Analyze these recent events and provide:
1. A concise event summary (max 5 words)
2. Exactly 3 key risk factors (each max 6 words)

Recent Events:
${eventDetails}

Average Severity: ${avgSeverity.toFixed(1)}
Total Oil Price Impact: ${oilPriceChange}

Format your response EXACTLY as JSON:
{
  "eventSummary": "brief summary here",
  "topFactors": ["factor 1", "factor 2", "factor 3"]
}`;

        //const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response (handle markdown code blocks)
        let jsonText = text.trim();
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        
        const analysis = JSON.parse(jsonText);
        if (analysis.eventSummary) eventSummary = analysis.eventSummary;
        if (Array.isArray(analysis.topFactors) && analysis.topFactors.length === 3) {
          topFactors = analysis.topFactors;
        }
      } catch (err) {
        console.error("Gemini analysis failed, using defaults:", err);
        // Use default values calculated above
      }
    }

    const briefing = {
      event: eventSummary,
      riskScore: riskScore,
      predictedImpact: {
        oilPriceChange: oilPriceChange,
        supplyChainDisruption: supplyChainDisruption,
      },
      topFactors: topFactors,
    };

    res.json(briefing);
  } catch (err) {
    console.error("Error generating crisis briefing:", err);
    res.status(500).json({ error: "Failed to generate crisis briefing" });
  }
});

app.get("/api/shipping/status", async (req, res) => {
  const status = {
    tankersInRegion: Math.floor(18 + Math.random() * 8),
    avgSpeedKnots: parseFloat((7 + Math.random() * 2).toFixed(1)),
    reroutesDetected: Math.floor(3 + Math.random() * 5),
  };
  res.json(status);
});

app.get("/api/charts/risk-oil", async (req, res) => {
  // Generate real-time data points (last 6 data points at 30-min intervals)
  const now = new Date();
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    const timePoint = new Date(now.getTime() - i * 30 * 60 * 1000);
    const baseRisk = 45 + (Math.random() - 0.5) * 30;
    const baseOil = 78.5 + (Math.random() - 0.5) * 10;
    
    data.push({
      time: timePoint.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      risk: Math.round(Math.max(30, Math.min(85, baseRisk))),
      oilPrice: parseFloat(Math.max(65, Math.min(95, baseOil)).toFixed(2))
    });
  }
  
  res.json({ data });
});

app.get("/api/map/data", async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    const newsCollection = db.collection("news");
    const region = req.query.region;

    // Country/Region to approximate coordinates mapping
    const LOCATION_MAP = {
      "Iran": [32.4279, 53.6880],
      "United States": [37.0902, -95.7129],
      "Saudi Arabia": [23.8859, 45.0792],
      "United Arab Emirates": [23.4241, 53.8478],
      "China": [35.8617, 104.1954],
      "Russia": [61.5240, 105.3188],
      "Oman": [21.4735, 55.9754],
      "Qatar": [25.3548, 51.1839],
      "Yemen": [15.5527, 48.5164],
      "Iraq": [33.2232, 43.6793],
      "Israel": [31.0461, 34.8516],
      "Syria": [34.8021, 38.9968],
      "Egypt": [26.8206, 30.8025],
      "Somalia": [5.1521, 46.1996],
      "Ethiopia": [9.1450, 40.4897],
      "Djibouti": [11.8251, 42.5903],
      "Panama": [8.5380, -80.7821],
      "Turkey": [38.9637, 35.2433],
      "Singapore": [1.3521, 103.8198],
      "Malaysia": [4.2105, 101.9758],
      "Indonesia": [0.7893, 113.9213],
    };

    // Strategic chokepoint/region to coordinates mapping
    const REGION_MAP = {
      "Strait of Hormuz": [26.566, 56.25],
      "Bab el-Mandeb": [12.7, 43.3],
      "Suez Canal": [30.7, 32.35],
      "Panama Canal": [9.08, -79.68],
      "Strait of Malacca": [2.5, 101.0],
      "Turkish Straits": [41.2, 29.1],
      "Middle East": [29.0, 48.0],
      "North America": [45.0, -100.0],
      "Asia": [34.0, 100.0],
      "Europe": [54.0, 15.0],
    };

    // Fetch recent events from 2026
    const recentEvents = await newsCollection
      .find({ year: 2026 })
      .sort({ eventDate: -1, _id: -1 })
      .limit(50)
      .toArray();

    // Transform events to markers
    const markers = recentEvents.map((evt) => {
      // Determine position based on country or region
      let position = LOCATION_MAP[evt.country] || REGION_MAP[evt.region];
      
      // If filtering by region, adjust coordinates slightly around the region center
      if (region && REGION_MAP[region]) {
        const regionCenter = REGION_MAP[region];
        // Add small random offset to avoid overlapping markers
        const latOffset = (Math.random() - 0.5) * 1.5;
        const lonOffset = (Math.random() - 0.5) * 1.5;
        position = [regionCenter[0] + latOffset, regionCenter[1] + lonOffset];
      } else if (!position) {
        // Default fallback position (Middle East)
        position = [29.0, 48.0];
      }

      // Map event type to marker type
      let markerType = "conflict"; // default
      if (evt.eventType === "Disaster") {
        markerType = "weather";
      } else if (["Economic", "Diplomacy"].includes(evt.eventType)) {
        markerType = "shipping";
      } else if (["Military", "Conflict", "Geopolitics"].includes(evt.eventType)) {
        markerType = "conflict";
      }

      // Determine severity label
      let severityLabel = "low";
      if (evt.severityScore >= 66) severityLabel = "high";
      else if (evt.severityScore >= 33) severityLabel = "medium";

      // Format date - show relative time or "Today"
      const dateObj = new Date(evt.eventDate);
      const now = new Date();
      const diffMs = now - dateObj;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let dateStr;
      if (diffDays === 0) {
        dateStr = "Today";
      } else if (diffDays === 1) {
        dateStr = "Yesterday";
      } else if (diffDays <= 7) {
        dateStr = `${diffDays} days ago`;
      } else {
        dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      return {
        position: position,
        label: evt.headline || evt.title || "Unknown Event",
        type: markerType,
        date: dateStr,
        severity: severityLabel,
        description: `${evt.country || evt.region} - ${evt.eventType} (Risk: ${evt.riskScore || "N/A"})`,
        riskScore: evt.riskScore,
        predictedOilMove: evt.predictedOilMovePct48h || evt.modelPredictedOilMovePct || 0,
      };
    });

    res.json({ markers });
  } catch (err) {
    console.error("Error fetching map data:", err);
    res.status(500).json({ error: "Failed to fetch map data", markers: [] });
  }
});

// —— Solana Predictions & Betting ——

app.post("/api/solana/snapshots", async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    const { predictions, blockHash } = req.body ?? {};
    if (!Array.isArray(predictions) || predictions.length === 0 || !blockHash) {
      return res.status(400).json({ error: "predictions array and blockHash required" });
    }
    const doc = {
      predictions,
      blockHash: String(blockHash),
      createdAt: new Date(),
    };
    const result = await db.collection("prediction_snapshots").insertOne(doc);
    res.status(201).json({
      id: result.insertedId.toString(),
      predictions: doc.predictions,
      blockHash: doc.blockHash,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("Create snapshot:", err);
    res.status(500).json({ error: "Failed to create snapshot" });
  }
});

app.get("/api/solana/snapshots", async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const docs = await db
      .collection("prediction_snapshots")
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    res.json({
      snapshots: docs.map((d) => ({
        id: d._id.toString(),
        predictions: d.predictions,
        blockHash: d.blockHash,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error("List snapshots:", err);
    res.status(500).json({ error: "Failed to list snapshots" });
  }
});

app.get("/api/solana/snapshots/:id", async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    let id;
    try {
      id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "Invalid snapshot id" });
    }
    const doc = await db.collection("prediction_snapshots").findOne({ _id: id });
    if (!doc) return res.status(404).json({ error: "Snapshot not found" });
    res.json({
      id: doc._id.toString(),
      predictions: doc.predictions,
      blockHash: doc.blockHash,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("Get snapshot:", err);
    res.status(500).json({ error: "Failed to get snapshot" });
  }
});

function generateMockTxSignature() {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < 88; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

app.post("/api/solana/bets", requireAuth, async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    const { snapshotId, targetDay, betSide, solAmount, walletAddress } = req.body ?? {};
    if (!snapshotId || !targetDay || betSide == null || solAmount == null) {
      return res.status(400).json({ error: "snapshotId, targetDay, betSide, solAmount required" });
    }
    if (!["YES", "NO"].includes(String(betSide).toUpperCase())) {
      return res.status(400).json({ error: "betSide must be YES or NO" });
    }
    const day = parseInt(targetDay, 10);
    if (day < 1 || day > 7) return res.status(400).json({ error: "targetDay must be 1–7" });
    const amount = parseFloat(solAmount);
    if (isNaN(amount) || amount <= 0 || amount > 1000) {
      return res.status(400).json({ error: "solAmount must be between 0 and 1000" });
    }
    let oid;
    try {
      oid = new ObjectId(snapshotId);
    } catch {
      return res.status(400).json({ error: "Invalid snapshotId" });
    }
    const snapshot = await db.collection("prediction_snapshots").findOne({ _id: oid });
    if (!snapshot) return res.status(404).json({ error: "Snapshot not found" });
    const pred = snapshot.predictions.find((p) => p.day === day);
    if (!pred) return res.status(400).json({ error: "targetDay not in snapshot" });
    const txSig = walletAddress ? generateMockTxSignature() : generateMockTxSignature();
    const bet = {
      userId: req.user.email,
      snapshotId: snapshotId,
      targetDay: day,
      betSide: String(betSide).toUpperCase(),
      solAmount: amount,
      walletAddress: walletAddress ? String(walletAddress) : null,
      transactionSignature: txSig,
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("bets").insertOne(bet);
    res.status(201).json({
      id: result.insertedId.toString(),
      ...bet,
    });
  } catch (err) {
    console.error("Place bet:", err);
    res.status(500).json({ error: "Failed to place bet" });
  }
});

app.get("/api/solana/bets", requireAuth, async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    const docs = await db
      .collection("bets")
      .find({ userId: req.user.email })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json({
      bets: docs.map((d) => ({
        id: d._id.toString(),
        snapshotId: d.snapshotId,
        targetDay: d.targetDay,
        betSide: d.betSide,
        solAmount: d.solAmount,
        walletAddress: d.walletAddress,
        transactionSignature: d.transactionSignature,
        status: d.status,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error("List bets:", err);
    res.status(500).json({ error: "Failed to list bets" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
