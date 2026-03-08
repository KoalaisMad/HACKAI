"use client";

import { useState, useEffect } from "react";
import { Ship, TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import { shippingApi, isBackendConfigured } from "@/lib/api";
import { parseOilPredictions, generateRealisticPredictions, generateEventBasedPredictions, formatPercentage, type OilPrediction } from "@/lib/oilPredictions";
import { getCurrentOilPrice, getCurrentRisk } from "@/lib/realTimeOilData";
import { type HistoricalEvent, calculateCurrentImpact } from "@/lib/historicalEvents";

const defaultStatus = {
  tankersInRegion: 21,
  avgSpeedKnots: 7.8,
  reroutesDetected: 5,
};

type ShippingStatusProps = {
  selectedHistoricalEvent?: HistoricalEvent | null;
};

export default function ShippingStatus({ selectedHistoricalEvent }: ShippingStatusProps) {
  const [status, setStatus] = useState(defaultStatus);
  const [oilPredictions, setOilPredictions] = useState<OilPrediction[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isBackendConfigured()) {
      // Simulate dynamic shipping data
      const updateShipping = () => {
        setStatus({
          tankersInRegion: Math.floor(18 + Math.random() * 8),
          avgSpeedKnots: parseFloat((7 + Math.random() * 2).toFixed(1)),
          reroutesDetected: Math.floor(3 + Math.random() * 5),
        });
      };
      updateShipping();
      const interval = setInterval(updateShipping, 15000);
      return () => clearInterval(interval);
    } else {
      shippingApi
        .getShippingStatus()
        .then(setStatus)
        .catch(() => {});
    }
  }, []);

  // Load oil price predictions
  useEffect(() => {
    const loadPredictions = () => {
      setIsUpdating(true);
      
      // Get current real-time oil price and risk level
      const currentPrice = getCurrentOilPrice();
      const currentRisk = getCurrentRisk();
      
      // If a historical event is selected, generate event-based predictions
      if (selectedHistoricalEvent) {
        const currentImpact = calculateCurrentImpact(selectedHistoricalEvent);
        const predictions = generateEventBasedPredictions(
          currentPrice,
          currentImpact.currentRiskScore,
          currentImpact.currentOilPriceChange
        );
        setOilPredictions(predictions);
        setLastUpdate(new Date());
        setTimeout(() => setIsUpdating(false), 500);
        return;
      }
      
      fetch('/oil_price_predictions.csv')
        .then(res => res.text())
        .then(csvData => {
          const predictions = parseOilPredictions(csvData, currentPrice, currentRisk);
          setOilPredictions(predictions);
          setLastUpdate(new Date());
        })
        .catch(() => {
          const predictions = generateRealisticPredictions(currentPrice, currentRisk);
          setOilPredictions(predictions);
          setLastUpdate(new Date());
        })
        .finally(() => {
          setTimeout(() => setIsUpdating(false), 500);
        });
    };

    loadPredictions();

    // Update every 8-12 seconds (only when no event is selected)
    if (!selectedHistoricalEvent) {
      const getRandomInterval = () => 8000 + Math.random() * 4000;
      
      let timeoutId: NodeJS.Timeout;
      const scheduleNext = () => {
        timeoutId = setTimeout(() => {
          loadPredictions();
          scheduleNext();
        }, getRandomInterval());
      };
      
      scheduleNext();

      return () => clearTimeout(timeoutId);
    }
  }, [selectedHistoricalEvent]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-center gap-2">
        <Ship className="h-5 w-5 text-[var(--accent-blue)]" />
        <h2 className="text-lg font-semibold text-white">Shipping Status</h2>
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-3">
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
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-[#0d1117]">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect width="100" height="100" fill="#161b22" />
            {/* Shipping routes */}
            <path
              d="M 10 50 Q 30 30, 50 40 T 90 35"
              stroke="#3b82f6"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
              strokeDasharray="2,2"
            />
            <path
              d="M 10 60 Q 35 70, 60 55 T 90 50"
              stroke="#3b82f6"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
              strokeDasharray="2,2"
            />
            {/* Tankers */}
            {[
              [20, 48],
              [35, 35],
              [48, 42],
              [52, 58],
              [65, 52],
              [75, 38],
              [82, 50],
            ].map(([x, y], i) => (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={4}
                  height={3}
                  fill={i < 2 ? "#f97316" : "#3b82f6"}
                  opacity={0.9}
                />
                <circle
                  cx={x + 2}
                  cy={y + 1.5}
                  r={6}
                  fill={i < 2 ? "#f97316" : "#3b82f6"}
                  opacity={0.1}
                />
              </g>
            ))}
            {/* Reroute alerts */}
            <circle cx="35" cy="35" r="8" fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.6" />
            <circle cx="52" cy="58" r="8" fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Oil Price Predictions */}
      {oilPredictions.length > 0 && (
        <div className="border-t border-[var(--border)] pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--accent-blue)]" />
              <h3 className="text-sm font-medium text-white">
                5-Day Oil Price Predictions
              </h3>
              {selectedHistoricalEvent && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30">
                  Event Impact
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <RefreshCw 
                className={`h-3 w-3 ${isUpdating ? 'animate-spin' : ''}`}
              />
              <span>
                {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {oilPredictions.map((pred) => (
              <div
                key={pred.day}
                className={`rounded-lg bg-[var(--darker-bg)] p-2 border border-[var(--border)] transition-all duration-500 ${
                  isUpdating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                <div className="text-xs text-[var(--text-muted)] mb-1">
                  Day {pred.day}
                </div>
                <div className="flex items-center gap-1">
                  {pred.percentageChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      pred.percentageChange >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatPercentage(pred.percentageChange)}
                  </span>
                </div>
                <div className="text-xs text-white font-medium mt-1">
                  ${pred.predictedPrice.toFixed(2)}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {pred.value >= 0 ? '+' : ''}${pred.value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
