"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { eventsApi, isBackendConfigured } from "@/lib/api";
import type { EventItem, EventActivityPoint } from "@/lib/api-types";

const defaultEvents: EventItem[] = [
  { time: "18:02", text: "Tanker Reroutes After Threat Risk", severity: "High" },
  { time: "17:50", text: "Missile Test Near Shipping Lane Risk", severity: "Med." },
  { time: "17:35", text: "Insurance Rates Spike", severity: "Med." },
];

const defaultChartData: EventActivityPoint[] = [
  { time: "12:00", value: 45 },
  { time: "13:00", value: 52 },
  { time: "14:00", value: 48 },
  { time: "15:00", value: 58 },
  { time: "16:00", value: 55 },
  { time: "17:00", value: 62 },
  { time: "18:00", value: 68 },
];

export default function EventFeed() {
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [chartData, setChartData] = useState<EventActivityPoint[]>(defaultChartData);

  useEffect(() => {
    if (!isBackendConfigured()) return;
    eventsApi
      .getEventFeed()
      .then((res) => {
        if (res.events?.length) setEvents(res.events);
        if (res.activityChart?.length) setChartData(res.activityChart);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">Event Feed</h2>

      <div className="space-y-4">
        {events.map((event, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)]/50 bg-[var(--background)]/50 p-3 hover:bg-[var(--background)]/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--foreground)]/70">
                {event.time}
              </span>
              <span className="text-sm text-white">{event.text}</span>
            </div>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                event.severity === "High"
                  ? "bg-[var(--accent-red)]/20 text-[var(--accent-red)]"
                  : "bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]"
              }`}
            >
              {event.severity}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 h-24 min-h-[96px] w-full">
        <ResponsiveContainer width="100%" height={96}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#2f3336" }}
            />
            <YAxis
              hide
              domain={[30, 80]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1f26",
                border: "1px solid #2f3336",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
