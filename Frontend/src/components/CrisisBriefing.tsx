"use client";

import { useState, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { crisisApi, isBackendConfigured } from "@/lib/api";
import type { CrisisBriefingResponse } from "@/lib/api-types";

const defaultBriefing: CrisisBriefingResponse = {
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

export default function CrisisBriefing() {
  const [briefing, setBriefing] = useState(defaultBriefing);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isBackendConfigured()) return;
    crisisApi
      .getCrisisBriefing()
      .then(setBriefing)
      .catch(() => {});
  }, []);

  async function handlePlayBriefing() {
    if (audioLoading) return;

    const text = [
      "Crisis briefing.",
      `Event: ${briefing.event}.`,
      `Risk score: ${briefing.riskScore} out of 100.`,
      `Predicted impact: oil price change ${briefing.predictedImpact.oilPriceChange},`,
      `supply chain disruption ${briefing.predictedImpact.supplyChainDisruption}.`,
      `Top factors: ${briefing.topFactors.join(", ")}.`,
    ].join(" ");

    if (!text.trim()) return;

    setAudioLoading(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play().catch(() => {});
      }
    } finally {
      setAudioLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">Crisis Briefing</h2>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-[var(--foreground)]/60">Event</div>
          <div className="text-sm font-medium text-white">{briefing.event}</div>
        </div>

        <div>
          <div className="text-xs text-[var(--foreground)]/60">Risk Score</div>
          <div className="text-sm font-medium text-white">
            <span className="text-lg font-bold text-[var(--accent-red)]">
              {briefing.riskScore}
            </span>{" "}
            / 100
          </div>
        </div>

        <div>
          <div className="text-xs text-[var(--foreground)]/60 mb-1">
            Predicted Impact
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-[var(--accent-green)]">
              Oil Price Change:{" "}
              <span className="font-bold">
                {briefing.predictedImpact.oilPriceChange}
              </span>
            </div>
            <div className="text-sm font-medium text-[var(--accent-orange)]">
              Supply Chain Disruption:{" "}
              <span className="font-bold">
                {briefing.predictedImpact.supplyChainDisruption}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-[var(--foreground)]/60 mb-2">
            Top Factors
          </div>
          <ul className="space-y-1 text-sm text-[var(--foreground)]/90">
            {briefing.topFactors.map((factor, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-orange)]" />
                {factor}
              </li>
            ))}
          </ul>
        </div>

        {briefing.audioBriefingUrl ? (
          <a
            href={briefing.audioBriefingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90"
          >
            <Play className="h-4 w-4" />
            Play Audio Briefing
          </a>
        ) : (
          <button
            type="button"
            onClick={handlePlayBriefing}
            disabled={audioLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-blue)]/90 disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {audioLoading ? "Preparing Audio..." : "Play Audio Briefing"}
          </button>
        )}
      </div>
      <audio ref={audioRef} hidden />
    </div>
  );
}
