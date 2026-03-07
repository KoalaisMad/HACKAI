"use client";

import { Play } from "lucide-react";

export default function CrisisBriefing() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">Crisis Briefing</h2>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-[var(--foreground)]/60">
            Event
          </div>
          <div className="text-sm font-medium text-white">
            Tanker Security Incident
          </div>
        </div>

        <div>
          <div className="text-xs text-[var(--foreground)]/60">
            Risk Score
          </div>
          <div className="text-sm font-medium text-white">
            <span className="text-lg font-bold text-[var(--accent-red)]">82</span>{" "}
            / 100
          </div>
        </div>

        <div>
          <div className="text-xs text-[var(--foreground)]/60 mb-1">
            Predicted Impact
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-[var(--accent-green)]">
              Oil Price Change: <span className="font-bold">+3.4%</span>
            </div>
            <div className="text-sm font-medium text-[var(--accent-orange)]">
              Supply Chain Disruption: <span className="font-bold">Moderate</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-[var(--foreground)]/60 mb-2">
            Top Factors
          </div>
          <ul className="space-y-1 text-sm text-[var(--foreground)]/90">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-orange)]" />
              Multiple Tanker Reroutes
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-orange)]" />
              Surge in News Reports
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-orange)]" />
              Military Activity Detected
            </li>
          </ul>
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90">
          <Play className="h-4 w-4" />
          Play Audio Briefing
        </button>
      </div>
    </div>
  );
}
