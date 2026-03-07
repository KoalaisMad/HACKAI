"use client";

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

const chartData = [
  { time: "12:00", risk: 45, oilPrice: 52 },
  { time: "14:00", risk: 52, oilPrice: 55 },
  { time: "16:00", risk: 48, oilPrice: 52 },
  { time: "17:00", risk: 65, oilPrice: 58 },
  { time: "17:45", risk: 78, oilPrice: 62 },
  { time: "18:00", risk: 82, oilPrice: 65 },
];

export default function RiskOilPriceChart() {
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
            <ReferenceLine
              x="17:45"
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{
                value: "17:45 Tanker Alert Issued",
                position: "top",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />
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
