"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  compareInvestments,
  calculateDiversifiedPortfolio,
  generateTimeHorizonProjections,
  type InvestmentComparison as InvestmentComparisonType,
} from "@/lib/investmentCalculator";

export default function InvestmentComparison() {
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [timeHorizon, setTimeHorizon] = useState(30);
  const [comparison, setComparison] = useState<InvestmentComparisonType | null>(null);
  const [diversified, setDiversified] = useState<any>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    updateCalculations();
  }, [investmentAmount, timeHorizon]);

  const updateCalculations = () => {
    // Use realistic oil prices
    const currentOilPrice = 78.5;
    const predictedOilPrice = 82.3;

    const comp = compareInvestments(investmentAmount, currentOilPrice, predictedOilPrice, timeHorizon);
    const div = calculateDiversifiedPortfolio(investmentAmount, currentOilPrice, predictedOilPrice, timeHorizon);
    const timeSeries = generateTimeHorizonProjections(investmentAmount, currentOilPrice, predictedOilPrice);

    setComparison(comp);
    setDiversified(div);
    setTimeSeriesData(timeSeries);
  };

  const barChartData = comparison
    ? [
        {
          name: "Oil & Gas",
          value: comparison.oil.projectedValue,
          roi: comparison.oil.roiPercentage,
        },
        {
          name: "Clean Energy",
          value: comparison.cleanEnergy.projectedValue,
          roi: comparison.cleanEnergy.roiPercentage,
        },
        {
          name: "Diversified",
          value: diversified?.projectedValue || 0,
          roi: diversified?.roiPercentage || 0,
        },
      ]
    : [];

  const getRecommendationText = () => {
    if (!comparison) return "";
    switch (comparison.recommendation) {
      case "oil":
        return "Based on current predictions, oil investments show better short-term returns.";
      case "cleanEnergy":
        return "Clean energy investments offer better growth potential with strong policy support.";
      case "diversify":
        return "Returns are similar - diversification recommended to balance risk and reward.";
    }
  };

  const getRecommendationColor = () => {
    if (!comparison) return "var(--foreground)";
    switch (comparison.recommendation) {
      case "oil":
        return "var(--accent-orange)";
      case "cleanEnergy":
        return "var(--accent-green)";
      case "diversify":
        return "var(--accent-blue)";
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-[var(--accent-green)]" />
          <h2 className="text-lg font-semibold text-white">Investment Calculator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Investment Amount ($)
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              min="1000"
              max="1000000"
              step="1000"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-white focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Time Horizon (Days)
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-white focus:border-[var(--accent-blue)] focus:outline-none"
            >
              <option value="7">1 Week</option>
              <option value="14">2 Weeks</option>
              <option value="30">1 Month</option>
              <option value="60">2 Months</option>
              <option value="90">3 Months</option>
              <option value="180">6 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Oil Investment */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[var(--foreground)]/70">Oil & Gas</h3>
                <div className={`text-xs px-2 py-1 rounded ${
                  comparison.oil.roiPercentage >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {comparison.oil.roiPercentage >= 0 ? '+' : ''}{comparison.oil.roiPercentage}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${comparison.oil.projectedValue.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--foreground)]/60">
                Profit: ${comparison.oil.roi >= 0 ? '+' : ''}{comparison.oil.roi.toLocaleString()}
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--foreground)]/60">Risk</span>
                  <span className="text-[var(--accent-orange)]">{comparison.oil.riskLevel}</span>
                </div>
              </div>
            </div>

            {/* Clean Energy Investment */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[var(--foreground)]/70">Clean Energy</h3>
                <div className={`text-xs px-2 py-1 rounded ${
                  comparison.cleanEnergy.roiPercentage >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {comparison.cleanEnergy.roiPercentage >= 0 ? '+' : ''}{comparison.cleanEnergy.roiPercentage}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${comparison.cleanEnergy.projectedValue.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--foreground)]/60">
                Profit: ${comparison.cleanEnergy.roi >= 0 ? '+' : ''}{comparison.cleanEnergy.roi.toLocaleString()}
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--foreground)]/60">Risk</span>
                  <span className="text-[var(--accent-green)]">{comparison.cleanEnergy.riskLevel}</span>
                </div>
              </div>
            </div>

            {/* Diversified Portfolio */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[var(--foreground)]/70">Diversified 50/50</h3>
                <div className={`text-xs px-2 py-1 rounded ${
                  diversified.roiPercentage >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {diversified.roiPercentage >= 0 ? '+' : ''}{diversified.roiPercentage}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${diversified.projectedValue.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--foreground)]/60">
                Profit: ${diversified.roi >= 0 ? '+' : ''}{diversified.roi.toLocaleString()}
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--foreground)]/60">Risk</span>
                  <span className="text-[var(--accent-blue)]">{diversified.riskLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: getRecommendationColor() }} />
              <div>
                <h3 className="font-medium text-white mb-1">Investment Recommendation</h3>
                <p className="text-sm text-[var(--foreground)]/70">{getRecommendationText()}</p>
              </div>
            </div>
          </div>

          {/* Bar Chart Comparison */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Projected Returns Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--foreground)" tick={{ fill: "var(--foreground)" }} />
                <YAxis stroke="var(--foreground)" tick={{ fill: "var(--foreground)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => value ? `$${Number(value).toLocaleString()}` : '$0'}
                />
                <Bar dataKey="value" fill="var(--accent-blue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Series Growth Chart */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Growth Projection Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="days"
                  stroke="var(--foreground)"
                  tick={{ fill: "var(--foreground)" }}
                  label={{ value: "Days", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  stroke="var(--foreground)"
                  tick={{ fill: "var(--foreground)" }}
                  label={{ value: "Value ($)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => value ? `$${Number(value).toLocaleString()}` : '$0'}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="oil"
                  stroke="var(--accent-orange)"
                  strokeWidth={2}
                  name="Oil & Gas"
                />
                <Line
                  type="monotone"
                  dataKey="cleanEnergy"
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  name="Clean Energy"
                />
                <Line
                  type="monotone"
                  dataKey="diversified"
                  stroke="var(--accent-blue)"
                  strokeWidth={2}
                  name="Diversified"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
