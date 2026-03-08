"use client";

import { useState } from "react";
import Header from "@/components/Header";
import GlobalRiskMap from "@/components/GlobalRiskMap";
import EventFeed from "@/components/EventFeed";
import RiskOilPriceChart from "@/components/RiskOilPriceChart";
import ShippingStatus from "@/components/ShippingStatus";
import CrisisBriefing from "@/components/CrisisBriefing";
import ChatBot from "@/components/ChatBot";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { RiskOilDataPoint } from "@/lib/realTimeOilData";
import type { HistoricalEvent } from "@/lib/historicalEvents";

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState("Strait of Hormuz");
  const [selectedDataPoint, setSelectedDataPoint] = useState<RiskOilDataPoint | null>(null);
  const [selectedHistoricalEvent, setSelectedHistoricalEvent] = useState<HistoricalEvent | null>(null);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Header
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />

        <main className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Global Risk Map - takes 2 columns */}
            <div className="lg:col-span-2">
              <GlobalRiskMap 
                selectedRegion={selectedRegion}
                onHistoricalEventClick={(event) => {
                  setSelectedHistoricalEvent(event);
                  setSelectedDataPoint(null); // Clear data point selection
                }}
              />
            </div>

            {/* Right column: Crisis Briefing first, then Event Feed */}
            <div className="flex flex-col gap-6">
              <CrisisBriefing 
                selectedDataPoint={selectedDataPoint}
                selectedHistoricalEvent={selectedHistoricalEvent}
              />
              <EventFeed />
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <RiskOilPriceChart onPointClick={(point) => {
              setSelectedDataPoint(point);
              setSelectedHistoricalEvent(null); // Clear historical event selection
            }} />
            <ShippingStatus selectedHistoricalEvent={selectedHistoricalEvent} />
          </div>

          <ChatBot />
        </main>
      </div>
    </ProtectedRoute>
  );
}