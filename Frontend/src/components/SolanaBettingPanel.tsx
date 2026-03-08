"use client";

import { useState, useEffect } from "react";
import { Coins, ChevronUp, ChevronDown, Wallet, Loader2 } from "lucide-react";
import { solanaApi, isBackendConfigured } from "@/lib/api";
import type { PredictionSnapshot, Bet } from "@/lib/api-types";

interface SolanaBettingPanelProps {
  snapshot: PredictionSnapshot | null;
  onBetPlaced?: () => void;
}

export default function SolanaBettingPanel({
  snapshot,
  onBetPlaced,
}: SolanaBettingPanelProps) {
  const [targetDay, setTargetDay] = useState(1);
  const [betSide, setBetSide] = useState<"YES" | "NO">("YES");
  const [solAmount, setSolAmount] = useState(0.1);
  const [walletAddress, setWalletAddress] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myBets, setMyBets] = useState<Bet[]>([]);

  const loadBets = () => {
    if (!isBackendConfigured()) return;
    solanaApi.getMyBets().then((r) => setMyBets(r.bets)).catch(() => {});
  };

  useEffect(() => {
    loadBets();
  }, []);

  const pred = snapshot?.predictions.find((p) => p.day === targetDay);
  const predictedPrice = pred?.predictedPrice ?? 0;

  const handlePlaceBet = async () => {
    if (!snapshot || !isBackendConfigured()) {
      setError("Backend not configured. Set NEXT_PUBLIC_API_URL.");
      return;
    }
    setError(null);
    setIsPlacing(true);
    try {
      await solanaApi.placeBet({
        snapshotId: snapshot.id,
        targetDay,
        betSide,
        solAmount,
        walletAddress: walletAddress.trim() || undefined,
      });
      loadBets();
      onBetPlaced?.();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to place bet";
      setError(msg);
    } finally {
      setIsPlacing(false);
    }
  };

  if (!isBackendConfigured()) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Place a Bet</h3>
        <p className="text-sm text-[var(--foreground)]/60">
          Configure NEXT_PUBLIC_API_URL to enable betting.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="h-5 w-5 text-[var(--accent-orange)]" />
        <h3 className="text-lg font-semibold text-white">Place a Bet</h3>
      </div>
      <p className="text-sm text-[var(--foreground)]/60 mb-4">
        Bet YES or NO on whether the actual oil price will be above the predicted
        price for a chosen day.
      </p>

      {!snapshot ? (
        <p className="text-sm text-[var(--foreground)]/60">
          Load the predictions chart to create a betting round.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Target Day (1–7)
            </label>
            <select
              value={targetDay}
              onChange={(e) => setTargetDay(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-white focus:border-[var(--accent-blue)] focus:outline-none"
            >
              {snapshot.predictions.map((p) => (
                <option key={p.day} value={p.day}>
                  Day {p.day} — Predicted ${p.predictedPrice.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              Your Bet
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setBetSide("YES")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2 transition ${
                  betSide === "YES"
                    ? "border-green-500 bg-green-500/20 text-green-500"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
                YES (price above ${predictedPrice.toFixed(2)})
              </button>
              <button
                onClick={() => setBetSide("NO")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2 transition ${
                  betSide === "NO"
                    ? "border-red-500 bg-red-500/20 text-red-500"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
                NO (price at or below)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              SOL Amount
            </label>
            <input
              type="number"
              value={solAmount}
              onChange={(e) => setSolAmount(parseFloat(e.target.value) || 0)}
              min={0.01}
              max={1000}
              step={0.01}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-white focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">
              <Wallet className="h-4 w-4 inline mr-1" />
              Wallet Address (optional)
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-white placeholder:text-[var(--foreground)]/40 focus:border-[var(--accent-blue)] focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            onClick={handlePlaceBet}
            disabled={isPlacing}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-blue)] px-4 py-3 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlacing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing bet…
              </>
            ) : (
              <>
                <Coins className="h-4 w-4" />
                Place Bet ({solAmount} SOL)
              </>
            )}
          </button>
        </div>
      )}

      {myBets.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <h4 className="text-sm font-medium text-[var(--foreground)]/70 mb-2">
            Your Recent Bets
          </h4>
          <ul className="space-y-2 max-h-32 overflow-y-auto">
            {myBets.slice(0, 5).map((b) => (
              <li
                key={b.id}
                className="text-xs text-[var(--foreground)]/70 flex justify-between"
              >
                <span>
                  Day {b.targetDay} {b.betSide} {b.solAmount} SOL
                </span>
                <span className="text-[var(--foreground)]/50">{b.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
