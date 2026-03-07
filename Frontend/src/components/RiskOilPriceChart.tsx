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
import { TrendingUp } from "lucide-react";
import { chartsApi, isBackendConfigured } from "@/lib/api";

const defaultChartData = [
  { time: "12:00", risk: 45, oilPrice: 52 },
  { time: "14:00", risk: 52, oilPrice: 55 },
  { time: "16:00", risk: 48, oilPrice: 52 },
  { time: "17:00", risk: 65, oilPrice: 58 },
  { time: "17:45", risk: 78, oilPrice: 62 },
  { time: "18:00", risk: 82, oilPrice: 65 },
];

export default function RiskOilPriceChart() {
  const [chartData, setChartData] = useState(defaultChartData);
  const [eventMarker, setEventMarker] = useState<{ time: string; label: string } | undefined>({
    time: "17:45",
    label: "17:45 Tanker Alert Issued",
  });

  useEffect(() => {
    if (!isBackendConfigured()) return;
    chartsApi
      .getRiskOilTrend()
      .then((res) => {
        if (res.data?.length) setChartData(res.data);
        if (res.eventMarker) setEventMarker(res.eventMarker);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[var(--accent-orange)]" />
        <h2 className="text-lg font-semibold text-white">
          Risk & Oil Price Trend
        </h2>
      </div>

      <div className="h-48 min-h-[192px] w-full">
        <ResponsiveContainer width="100%" height={192}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#2f3336" }}
            />
            <YAxis
              domain={[30, 80]}
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
              dot={false}
              name="Risk"
            />
            <Line
              type="monotone"
              dataKey="oilPrice"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Oil Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
