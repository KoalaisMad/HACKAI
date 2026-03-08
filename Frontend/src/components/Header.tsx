"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  ChevronDown,
  Circle,
  LogIn,
  UserPlus,
  LogOut,
  Clock3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CHOKEPOINTS = [
  "Strait of Hormuz",
  "Bab el-Mandeb",
  "Suez Canal",
  "Panama Canal",
  "Strait of Malacca",
  "Turkish Straits",
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
];

type HeaderProps = {
  selectedRegion: string;
  setSelectedRegion: React.Dispatch<React.SetStateAction<string>>;
};

export default function Header({
  selectedRegion,
  setSelectedRegion,
}: HeaderProps) {
  const { user, logout } = useAuth();

  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [currentTime, setCurrentTime] = useState("");
  const [timezoneLabel, setTimezoneLabel] = useState("UTC");

  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detectedTimezone) {
      setSelectedTimezone(detectedTimezone);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();

        const timeFormatted = new Intl.DateTimeFormat("en-US", {
          timeZone: selectedTimezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);

        const tzFormatted =
          new Intl.DateTimeFormat("en-US", {
            timeZone: selectedTimezone,
            timeZoneName: "short",
          })
            .formatToParts(now)
            .find((part) => part.type === "timeZoneName")?.value || selectedTimezone;

        setCurrentTime(timeFormatted);
        setTimezoneLabel(tzFormatted);
      } catch {
        setCurrentTime("");
        setTimezoneLabel(selectedTimezone);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [selectedTimezone]);

  const timezoneOptions = useMemo(() => {
    return Array.from(new Set([selectedTimezone, ...TIMEZONES]));
  }, [selectedTimezone]);

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]">
          <span className="text-lg font-bold">C</span>
        </div>
        <h1 className="text-xl font-semibold text-white">StraitWatch</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex items-center gap-2">
          <Globe className="h-4 w-4 text-[var(--foreground)]/70" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50"
          >
            {CHOKEPOINTS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--foreground)]/70" />
        </div>

        <div className="relative flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-[var(--foreground)]/70" />
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50"
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[var(--foreground)]/70" />
        </div>

        <div className="flex items-center gap-2">
          <Circle className="h-2.5 w-2.5 animate-pulse fill-[var(--accent-red)] text-[var(--accent-red)]" />
          <span className="text-sm font-medium text-[var(--accent-red)]">
            Live
          </span>
        </div>

        <span className="text-sm text-[var(--foreground)]/60">
          Local Time: {currentTime} {timezoneLabel}
        </span>

        <div className="flex items-center gap-2 border-l border-[var(--border)] pl-6">
          {user ? (
            <>
              <span className="max-w-[120px] truncate text-sm text-[var(--foreground)]/80">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--border)]"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-sm text-white transition hover:bg-[var(--border)]"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-blue)]/90"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}