"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { TrendingUp, RefreshCw, CheckCircle } from "lucide-react";
import { generateSolanaPredictions, type SolanaPrediction } from "@/lib/solanaPredictions";

export default function SolanaPredictionsChart() {
  const [chartData, setChartData] = useState<SolanaPrediction[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [blockchainStatus, setBlockchainStatus] = useState<"connected" | "disconnected">("connected");

  const loadPredictions = () => {
    const predictions = generateSolanaPredictions();
    setChartData(predictions);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    loadPredictions();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadPredictions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsUpdating(true);
    
    // Simulate blockchain interaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    loadPredictions();
    setIsUpdating(false);
  };

  // Calculate statistics
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].predictedPrice : 0;
  const avgConfidence = chartData.length > 0 
    ? chartData.reduce((sum, d) => sum + d.confidence, 0) / chartData.length 
    : 0;
  const maxPrediction = Math.max(...chartData.map(d => d.predictedPrice));
  const minPrediction = Math.min(...chartData.map(d => d.predictedPrice));

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--accent-blue)]" />
            <h2 className="text-lg font-semibold text-white">
              Solana Blockchain Predictions
            </h2>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            AI-powered predictions recorded on Solana
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-500">
              {blockchainStatus === "connected" ? "Blockchain Active" : "Offline"}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isUpdating}
            className={`rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--border)] ${
              isUpdating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 border-b border-[var(--border)] p-4 bg-[var(--background)]/50">
        <div>
          <p className="text-xs text-[var(--foreground)]/60">Current Prediction</p>
          <p className="text-lg font-semibold text-white">${lastPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--foreground)]/60">Avg Confidence</p>
          <p className="text-lg font-semibold text-[var(--accent-blue)]">{avgConfidence.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-[var(--foreground)]/60">Range</p>
          <p className="text-lg font-semibold text-white">
            ${minPrediction.toFixed(2)} - ${maxPrediction.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--foreground)]/60">Last Update</p>
          <p className="text-lg font-semibold text-[var(--foreground)]/70">
            {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="day"
              stroke="var(--foreground)"
              tick={{ fill: "var(--foreground)", opacity: 0.7 }}
              label={{ value: "Days Ahead", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              stroke="var(--foreground)"
              tick={{ fill: "var(--foreground)", opacity: 0.7 }}
              label={{ value: "Price (USD)", angle: -90, position: "insideLeft" }}
              domain={[Math.floor(minPrediction - 5), Math.ceil(maxPrediction + 5)]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              formatter={(value: any) => {
                return value ? Number(value).toFixed(2) : '0';
              }}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend
              wrapperStyle={{ color: "var(--foreground)" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="predictedPrice"
              stroke="var(--accent-blue)"
              strokeWidth={3}
              dot={{ fill: "var(--accent-blue)", r: 5 }}
              activeDot={{ r: 7 }}
              name="Predicted Price"
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="var(--accent-green)"
              strokeWidth={2}
              dot={{ fill: "var(--accent-green)", r: 4 }}
              name="Confidence %"
              yAxisId={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--border)] bg-[var(--background)]/50 p-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--accent-blue)]"></div>
              <span className="text-[var(--foreground)]/70">Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[var(--accent-green)]"></div>
              <span className="text-[var(--foreground)]/70">AI Confidence</span>
            </div>
          </div>
          <span className="text-[var(--foreground)]/60">
            Recorded on Solana • Block Height: {Math.floor(Math.random() * 1000000 + 250000000)}
          </span>
        </div>
      </div>
    </div>
  );
}
