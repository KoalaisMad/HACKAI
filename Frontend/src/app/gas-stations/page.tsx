"use client";

import { useState } from "react";
import Header from "@/components/Header";
import GasStationsMap from "@/components/GasStationsMap";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function GasStationsPage() {
  const [selectedRegion, setSelectedRegion] = useState("Strait of Hormuz");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Header
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />

        <main className="p-6 relative z-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">Gas Stations Near You</h1>
            <p className="text-sm text-[var(--foreground)]/60 mt-1">
              Find nearby gas stations with real-time prices and locations
            </p>
          </div>
          
          <GasStationsMap />
        </main>
      </div>
    </ProtectedRoute>
  );
}
