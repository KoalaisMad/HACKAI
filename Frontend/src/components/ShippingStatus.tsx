"use client";

import { useState, useEffect } from "react";
import { Ship } from "lucide-react";
import { shippingApi, isBackendConfigured } from "@/lib/api";

const defaultStatus = {
  tankersInRegion: 21,
  avgSpeedKnots: 7.8,
  reroutesDetected: 5,
};

export default function ShippingStatus() {
  const [status, setStatus] = useState(defaultStatus);

  useEffect(() => {
    if (!isBackendConfigured()) return;
    shippingApi
      .getShippingStatus()
      .then(setStatus)
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-center gap-2">
        <Ship className="h-5 w-5 text-[var(--accent-blue)]" />
        <h2 className="text-lg font-semibold text-white">Shipping Status</h2>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <div>
            <div className="text-xs text-[var(--foreground)]/60">
              Tankers in Region
            </div>
            <div className="text-2xl font-bold text-white">
              {status.tankersInRegion}
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--foreground)]/60">
              Avg Speed
            </div>
            <div className="text-2xl font-bold text-white">
              {status.avgSpeedKnots} knots
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--foreground)]/60">
              Reroutes Detected
            </div>
            <div className="text-2xl font-bold text-[var(--accent-orange)]">
              {status.reroutesDetected}
            </div>
          </div>
        </div>

        {/* Mini map thumbnail */}
        <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-[#0d1117]">
          <svg
            viewBox="0 0 100 75"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect width="100" height="75" fill="#161b22" />
            {[
              [20, 30],
              [30, 25],
              [40, 35],
              [50, 55],
              [60, 40],
              [70, 50],
              [80, 35],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width={4}
                height={3}
                fill={i < 2 ? "#f97316" : "#3b82f6"}
                opacity={0.8}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
