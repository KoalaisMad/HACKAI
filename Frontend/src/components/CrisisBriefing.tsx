"use client";

import { useState, useEffect } from "react";
import { crisisApi, isBackendConfigured } from "@/lib/api";
import type { CrisisBriefingResponse } from "@/lib/api-types";
import type { RiskOilDataPoint } from "@/lib/realTimeOilData";
import { type HistoricalEvent, calculateCurrentImpact } from "@/lib/historicalEvents";

type CrisisBriefingProps = {
  selectedDataPoint?: RiskOilDataPoint | null;
  selectedHistoricalEvent?: HistoricalEvent | null;
};

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

function generateBriefingFromDataPoint(dataPoint: RiskOilDataPoint): CrisisBriefingResponse {
  const riskScore = dataPoint.risk;
  const oilPriceChange = dataPoint.oilPrice > 75 ? "+" + ((dataPoint.oilPrice - 75) / 75 * 100).toFixed(1) + "%" : "-" + ((75 - dataPoint.oilPrice) / 75 * 100).toFixed(1) + "%";
  
  let event = "Market Conditions";
  let supplyChainDisruption = "Low";
  let topFactors = ["Normal Trading Activity", "Stable Supply Routes", "Regular Market Conditions"];
  
  if (riskScore > 70) {
    event = "High Risk Alert";
    supplyChainDisruption = "High";
    topFactors = ["Critical Chokepoint Activity", "Security Concerns", "Supply Route Disruption"];
  } else if (riskScore > 50) {
    event = "Elevated Risk Situation";
    supplyChainDisruption = "Moderate";
    topFactors = ["Increased Maritime Activity", "Regional Tensions", "Weather Conditions"];
  } else if (riskScore > 30) {
    event = "Moderate Risk Level";
    supplyChainDisruption = "Low-Moderate";
    topFactors = ["Minor Shipping Delays", "Weather Advisory", "Routine Operations"];
  }
  
  return {
    event: `${event} - ${dataPoint.time}`,
    riskScore,
    predictedImpact: {
      oilPriceChange,
      supplyChainDisruption,
    },
    topFactors,
  };
}

function generateBriefingFromHistoricalEvent(historicalEvent: HistoricalEvent): CrisisBriefingResponse {
  const currentImpact = calculateCurrentImpact(historicalEvent);
  
  return {
    event: historicalEvent.title,
    riskScore: currentImpact.currentRiskScore,
    predictedImpact: {
      oilPriceChange: `+${currentImpact.currentOilPriceChange}%`,
      supplyChainDisruption: historicalEvent.supplyChainDisruption,
    },
    topFactors: currentImpact.adjustmentFactors,
  };
}

export default function CrisisBriefing({ selectedDataPoint, selectedHistoricalEvent }: CrisisBriefingProps) {
  const [briefing, setBriefing] = useState(defaultBriefing);
  const [isHistoricalMode, setIsHistoricalMode] = useState(false);
  const [historicalYear, setHistoricalYear] = useState<number | null>(null);

  useEffect(() => {
    console.log("briefing effect ran", {
      selectedDataPoint,
      selectedHistoricalEvent,
      time: new Date().toISOString()
    });

    if (selectedHistoricalEvent) {
      // Generate briefing from historical event with current economy adjustments
      console.log('CrisisBriefing received historical event:', selectedHistoricalEvent);
      const generatedBriefing = generateBriefingFromHistoricalEvent(selectedHistoricalEvent);
      console.log('Generated briefing from historical event:', generatedBriefing);
      setBriefing(generatedBriefing);
      setIsHistoricalMode(true);
      setHistoricalYear(selectedHistoricalEvent.year);
      return;
    }
    
    if (selectedDataPoint) {
      // Generate briefing from selected data point
      console.log('CrisisBriefing received data point:', selectedDataPoint);
      const generatedBriefing = generateBriefingFromDataPoint(selectedDataPoint);
      console.log('Generated briefing:', generatedBriefing);
      setBriefing(generatedBriefing);
      setIsHistoricalMode(false);
      setHistoricalYear(null);
      return;
    }
    
    // Fallback to backend API or default
    setIsHistoricalMode(false);
    setHistoricalYear(null);
    if (!isBackendConfigured()) return;
    console.log("getCrisisBriefing called", {
      selectedDataPoint,
      selectedHistoricalEvent,
      time: new Date().toISOString()
    });
    crisisApi
      .getCrisisBriefing()
      .then(setBriefing)
      .catch(() => {});
  }, [selectedDataPoint, selectedHistoricalEvent]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Crisis Briefing</h2>
        {selectedDataPoint && !isHistoricalMode && (
          <span className="text-xs text-[var(--accent-blue)] font-medium">
            📍 Point Selected
          </span>
        )}
        {isHistoricalMode && (
          <span className="text-xs text-purple-400 font-medium">
            📅 Historical Analysis
          </span>
        )}
      </div>

      {isHistoricalMode && historicalYear && (
        <div className="mb-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-2">
          <div className="text-xs text-purple-300 font-medium">
            {historicalYear} Event - Analyzing impact in today's economy
          </div>
        </div>
      )}

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
            {isHistoricalMode ? "Current Economy Adjustments" : "Top Factors"}
          </div>
          <ul className="space-y-1 text-sm text-[var(--foreground)]/90">
            {briefing.topFactors.map((factor, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isHistoricalMode ? "bg-purple-400" : "bg-[var(--accent-orange)]"}`} />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
