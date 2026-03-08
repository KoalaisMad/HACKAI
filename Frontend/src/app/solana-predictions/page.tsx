"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SolanaPredictionsChart from "@/components/SolanaPredictionsChart";
import SolanaBettingPanel from "@/components/SolanaBettingPanel";
import InvestmentComparison from "@/components/InvestmentComparison";
import ChatBot from "@/components/ChatBot";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { PredictionSnapshot } from "@/lib/api-types";

export default function SolanaPredictionsPage() {
  const [selectedRegion, setSelectedRegion] = useState("Strait of Hormuz");
  const [currentSnapshot, setCurrentSnapshot] = useState<PredictionSnapshot | null>(null);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)]">
        <Header
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
        />

        <main className="p-6 relative z-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Solana Blockchain Predictions
            </h1>
            <p className="text-[var(--foreground)]/70">
              Leveraging blockchain technology for transparent, decentralized oil price predictions
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Main predictions chart */}
            <div className="lg:col-span-2">
              <SolanaPredictionsChart onSnapshotCreated={setCurrentSnapshot} />
            </div>
            {/* Betting panel */}
            <div>
              <SolanaBettingPanel snapshot={currentSnapshot} />
            </div>
          </div>

          {/* Investment Comparison Section */}
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Investment Calculator
              </h2>
              <p className="text-[var(--foreground)]/70">
                Compare potential returns from oil vs clean energy investments
              </p>
            </div>
            <InvestmentComparison />
          </div>

          <ChatBot />
        </main>
      </div>
    </ProtectedRoute>
  );
}
