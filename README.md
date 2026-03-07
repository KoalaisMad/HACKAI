# Crisis Intelligence System

A real-time risk assessment and event monitoring dashboard for maritime activities, built with Next.js.

## Features

- **Global Risk Map** – Interactive map with ship markers and alert indicators (Tanker Security Alert, Storm Alerts, Missile Test)
- **Event Feed** – Chronological list of recent events with severity tags (High/Med) and activity chart
- **Risk & Oil Price Trend** – Dual-line chart showing risk and oil price over time with event markers
- **Shipping Status** – Key metrics (tankers in region, avg speed, reroutes) with mini map
- **Crisis Briefing** – Event summary, risk score, predicted impact, top factors, and audio briefing button

## Getting Started

```bash
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

## Project Structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout with dark theme
│   ├── page.tsx      # Dashboard page
│   └── globals.css   # Global styles & CSS variables
└── components/
    ├── Header.tsx           # Top bar with region/time selectors
    ├── GlobalRiskMap.tsx    # Map panel with alerts
    ├── EventFeed.tsx        # Event list + activity chart
    ├── RiskOilPriceChart.tsx # Risk & oil price trends
    ├── ShippingStatus.tsx   # Shipping metrics
    └── CrisisBriefing.tsx   # Crisis summary panel
```
