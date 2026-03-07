"use client";

import { Globe, Flame, CloudLightning, Bell } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(
  () => import("./MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] items-center justify-center bg-[#0d1117]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-blue)] border-t-transparent" />
      </div>
    ),
  }
);

export default function GlobalRiskMap() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-[var(--accent-blue)]" />
        <h2 className="text-lg font-semibold text-white">Global Risk Map</h2>
      </div>

      <div className="relative aspect-[4/3] min-h-[300px] overflow-hidden rounded-lg bg-[#0d1117]">
        <MapComponent />
      </div>
    </div>
  );
}
