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

All app code lives in the `Frontend` folder. From the repo root:

```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (line charts)
- **Lucide React** (icons)

## Backend integration

The frontend calls a backend when `NEXT_PUBLIC_API_URL` is set (e.g. in `.env`). Copy `Frontend/.env.example` to `Frontend/.env` and set your API base URL (no trailing slash). When set:

- **Auth**: Login, signup, and session use the backend; the client sends `Authorization: Bearer <token>` and expects your backend to return `user` and optionally `token` from login/signup and to expose `/api/auth/session` for the current user.
- **Dashboard**: Event feed, crisis briefing, shipping status, risk/oil chart (and optionally map data) are fetched from the backend. If the URL is not set, the app uses built-in mock data.

Expected backend paths (relative to base URL):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Login (body: `email`, `password`) |
| POST | `/api/auth/signup` | Signup (body: `email`, `password`, `name`, `country?`) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/session` | Current user (Bearer token) |
| GET | `/api/events` | Event feed + activity chart |
| GET | `/api/crisis/briefing` | Crisis briefing |
| GET | `/api/shipping/status` | Shipping metrics |
| GET | `/api/charts/risk-oil` | Risk & oil price trend |
| GET | `/api/map/data` | Map alerts and ships |

Request/response types are in `Frontend/src/lib/api-types.ts`. The client is in `Frontend/src/lib/api.ts` (and re-exported from `@/lib`).

## Project Structure

All source code is under `Frontend/`:

```
Frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout with dark theme
│   │   ├── page.tsx      # Dashboard page
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   └── globals.css   # Global styles & CSS variables
│   ├── components/
│   │   ├── Header.tsx           # Top bar with region/time selectors
│   │   ├── GlobalRiskMap.tsx    # Map panel with alerts
│   │   ├── EventFeed.tsx        # Event list + activity chart
│   │   ├── RiskOilPriceChart.tsx # Risk & oil price trends
│   │   ├── ShippingStatus.tsx   # Shipping metrics
│   │   └── CrisisBriefing.tsx   # Crisis summary panel
│   ├── context/
│   │   └── AuthContext.tsx  # Auth state
│   └── lib/
│       ├── api.ts           # Backend API client
│       ├── api-types.ts     # Request/response types
│       └── index.ts         # Re-exports
├── next.config.js
├── package.json
└── tsconfig.json
```
