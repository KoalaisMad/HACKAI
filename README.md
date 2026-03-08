# Crisis Intelligence System

A real-time risk assessment and event monitoring dashboard for maritime activities, built with Next.js.

## Features

- **Global Risk Map** – Interactive map with ship markers and alert indicators (Tanker Security Alert, Storm Alerts, Missile Test)
- **Event Feed** – Chronological list of recent events with severity tags (High/Med) and activity chart
- **Risk & Oil Price Trend** – Dual-line chart showing risk and oil price over time with event markers
- **Shipping Status** – Key metrics (tankers in region, avg speed, reroutes) with mini map
- **Crisis Briefing** – Event summary, risk score, predicted impact, top factors, and audio briefing button (positioned above the Event Feed)
- **StraitWatch Assistant** – In-app chatbot powered by Google Gemini for questions about risk, events, and shipping

## Getting Started

**Frontend (required):** From the repo root:

```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Backend (optional, for auth, dashboard data, and StraitWatch Assistant chat + voice):**

```bash
cd Backend
cp .env.example .env
# Edit .env: set GEMINI_API_KEY (chat), ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (voice)
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `Frontend/.env.local` to use the backend. The StraitWatch Assistant (Gemini chat + ElevenLabs voice) only works when the backend is running and these keys are configured.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (line charts)
- **Lucide React** (icons)

## AI Intelligence & Voice Assistant

## Google Gemini AI 

### Purpose

The **StraitWatch Assistant** is an AI-powered chatbot that helps users understand maritime risks, geopolitical events, and shipping disruptions in real time. It translates complex data from multiple sources—such as news feeds, ML predictions, and shipping activity—into clear explanations and actionable insights.

### Implementation

**Backend**

File: `index.js`

- Uses the `@google/generative-ai` SDK  
- Model: **gemini-2.0-flash**  
- Endpoint: `POST /api/chat`

The backend receives a conversation history from the frontend and sends it to Gemini for processing. The system prompt configures the assistant with knowledge about:

- maritime shipping routes  
- geopolitical incidents  
- oil supply chain risks  
- StraitWatch risk scores  
- ML model predictions  

Gemini then generates a contextual response that explains the situation in natural language.

**Frontend**

File: `ChatBot.tsx`

- Sends user messages to `/api/chat`  
- Maintains conversation history  
- Displays messages in a conversational UI  
- Supports **voice input using the Web Speech API**

This allows users to interact with the system using natural language instead of navigating dashboards or raw datasets.

### Data Context

Gemini responses are augmented with summarized outputs from:

- machine learning risk prediction models  
- shipping traffic signals  
- global incident datasets  
- energy market indicators  

This ensures the assistant provides **data-grounded explanations rather than generic AI responses**.

---

## ElevenLabs 

### Purpose

To improve accessibility and safety, StraitWatch converts AI responses into **natural spoken briefings** using ElevenLabs.

This enables users—such as analysts, operators, or drivers—to **receive risk updates without needing to look at their screens**.

### Implementation

**Backend**

File: `index.js`

- Uses `@elevenlabs/elevenlabs-js`  
- Endpoint: `POST /api/tts`  
- Model: **eleven_multilingual_v2**

Input:

```json
{
  "text": "AI generated response",
  "voiceId": "optional"
}


## Antigravity — AI Development Acceleration

During development, **Antigravity AI** played a key role in accelerating engineering workflows and maintaining code quality.

### Purpose

Antigravity assisted with debugging, development troubleshooting, and repository management, allowing the team to focus on building the core prediction market platform.

### Key Contributions

- Helped diagnose and fix backend integration issues across the AI pipeline
- Assisted with debugging API calls and data flow between services
- Provided guidance for implementing model integrations and chatbot logic

### Repository Recovery & Optimization

Antigravity also helped resolve critical repository issues that were blocking development:

- Resolved **complex Git divergence and rebase conflicts**
- Performed **history cleanup** to remove extremely large files
- Removed cached **GDELT data files exceeding 1GB**
- Restored the repository to a state where it could be successfully pushed to GitHub

This allowed the team to maintain a **clean, manageable codebase** and continue development without repository size limitations.

---

## Solana — Decentralized Prediction Market

### Purpose

Solana powers the **decentralized prediction market** layer of the platform, allowing users to place tokenized bets on future oil price movements.

### Implementation

- Users can submit predictions on future oil prices
- Each prediction requires a certain number of tokens to participate
- Smart contracts record the prediction and lock tokens into the market

When prediction outcomes are evaluated:

- Users with **accurate predictions receive token rewards**
- Users with incorrect predictions lose their stake

This creates an **incentivized market-driven forecasting system**, where collective intelligence contributes to more accurate predictions.

---

## MongoDB Atlas — Data Storage & Prediction History

### Purpose

MongoDB Atlas provides the **primary database infrastructure** for storing user activity, prediction history, and system data.

### Implementation

MongoDB stores:

- User accounts and authentication data
- Prediction submissions from users
- Token bet records
- Timestamps for all predictions and bets
- Historical snapshots of oil price predictions generated by the system

These stored prediction snapshots allow the system to:

- Track prediction performance over time
- Validate outcomes of the prediction market
- Maintain a transparent historical record of forecasts

Using MongoDB Atlas enables **scalable, real-time data storage** while supporting rapid queries across user predictions and market activity.
