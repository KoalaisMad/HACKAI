"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { TrendingUp, RefreshCw } from "lucide-react";
import { chartsApi, isBackendConfigured } from "@/lib/api";
import { generateRealTimeOilData, type RiskOilDataPoint } from "@/lib/realTimeOilData";

type RiskOilPriceChartProps = {
  onPointClick?: (dataPoint: RiskOilDataPoint) => void;
};

export default function RiskOilPriceChart({ onPointClick }: RiskOilPriceChartProps) {
  const [chartData, setChartData] = useState<RiskOilDataPoint[]>([]);
  const [eventMarker, setEventMarker] = useState<{ time: string; label: string } | undefined>();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<RiskOilDataPoint | null>(null);

  const handlePointClick = (dataPoint: RiskOilDataPoint) => {
    console.log('Point clicked:', dataPoint);
    setSelectedPoint(dataPoint);
    onPointClick?.(dataPoint);
  };

  useEffect(() => {
    // Try to load from backend API first
    if (isBackendConfigured()) {
      chartsApi
        .getRiskOilTrend()
        .then((res) => {
          if (res.data?.length) {
            const mapped = res.data.map(d => ({
              ...d,
              timestamp: Date.now()
            }));
            setChartData(mapped);
          }
          if (res.eventMarker) setEventMarker(res.eventMarker);
        })
        .catch(() => {
          // Fallback to real-time generated data
          setChartData(generateRealTimeOilData(6));
        });
    } else {
      // Use real-time generated data
      setChartData(generateRealTimeOilData(6));
    }
  }, []);

  // Update data every 5-8 seconds with real-time prices
  useEffect(() => {
    const updateData = () => {
      setIsUpdating(true);
      
      // Generate new real-time data
      const newData = generateRealTimeOilData(6);
      setChartData(newData);
      setLastUpdate(new Date());
      
      setTimeout(() => setIsUpdating(false), 500);
    };

    const getRandomInterval = () => 5000 + Math.random() * 3000; // 5-8 seconds
    
    let timeoutId: NodeJS.Timeout;
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        updateData();
        scheduleNext();
      }, getRandomInterval());
    };
    
    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[var(--accent-orange)]" />
          <h2 className="text-lg font-semibold text-white">
            Risk & Oil Price Trend
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isUpdating ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs text-[var(--text-muted)]">
            Live Data
          </span>
        </div>
      </div>

      <div className="h-48 min-h-[192px] w-full">
        <ResponsiveContainer width="100%" height={192}>
          <LineChart 
            data={chartData}
          >
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#2f3336" }}
            />
            <YAxis
              domain={[30, 95]}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#2f3336" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              labelFormatter={(label) => label}
              formatter={(value: any, name: any) => {
                if (typeof value !== 'number') return [value, name];
                return [
                  name === 'oilPrice' ? `$${value.toFixed(2)}` : value.toFixed(0),
                  name === 'oilPrice' ? 'WTI Crude' : 'Risk Level'
                ];
              }}
            />
            {eventMarker && (
              <ReferenceLine
                x={eventMarker.time}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{
                  value: eventMarker.label,
                  position: "top",
                  fill: "#94a3b8",
                  fontSize: 10,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="risk"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ 
                r: 4, 
                fill: "#f97316", 
                cursor: "pointer",
                onClick: (e: any, payload: any) => {
                  if (payload && payload.payload) {
                    handlePointClick(payload.payload as RiskOilDataPoint);
                  }
                }
              }}
              activeDot={{ 
                r: 6, 
                cursor: "pointer",
                onClick: (e: any, payload: any) => {
                  if (payload && payload.payload) {
                    handlePointClick(payload.payload as RiskOilDataPoint);
                  }
                }
              }}
              name="Risk Level"
            />
            <Line
              type="monotone"
              dataKey="oilPrice"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ 
                r: 4, 
                fill: "#3b82f6", 
                cursor: "pointer",
                onClick: (e: any, payload: any) => {
                  if (payload && payload.payload) {
                    handlePointClick(payload.payload as RiskOilDataPoint);
                  }
                }
              }}
              activeDot={{ 
                r: 6, 
                cursor: "pointer",
                onClick: (e: any, payload: any) => {
                  if (payload && payload.payload) {
                    handlePointClick(payload.payload as RiskOilDataPoint);
                  }
                }
              }}
              name="WTI Crude"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Values */}
      {chartData.length > 0 && (
        <div className="mt-4 flex items-center justify-around border-t border-[var(--border)] pt-3">
          <div className="text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">Current WTI Price</div>
            <div className="text-lg font-bold text-[var(--accent-blue)]">
              ${chartData[chartData.length - 1]?.oilPrice.toFixed(2)}
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">Risk Level</div>
            <div className="text-lg font-bold text-[var(--accent-orange)]">
              {chartData[chartData.length - 1]?.risk}%
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div className="text-center">
            <div className="text-xs text-[var(--text-muted)] mb-1">{selectedPoint ? 'Selected' : 'Last Update'}</div>
            <div className="text-xs font-medium text-white">
              {selectedPoint ? selectedPoint.time : lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
