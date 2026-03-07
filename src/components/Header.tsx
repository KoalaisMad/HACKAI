"use client";

import Link from "next/link";
import { Globe, ChevronDown, Circle, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]">
          <span className="text-lg font-bold">C</span>
        </div>
        <h1 className="text-xl font-semibold text-white">
          Crisis Intelligence System
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[var(--foreground)]/70" />
          <select className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50">
            <option>Region: Strait of Hormuz</option>
          </select>
          <ChevronDown className="h-4 w-4 -ml-6 text-[var(--foreground)]/70 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <select className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50">
            <option>Time Window: 24h</option>
          </select>
          <ChevronDown className="h-4 w-4 -ml-6 text-[var(--foreground)]/70 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <Circle className="h-2.5 w-2.5 fill-[var(--accent-red)] text-[var(--accent-red)] animate-pulse" />
          <span className="text-sm text-[var(--accent-red)] font-medium">Live</span>
        </div>

        <span className="text-sm text-[var(--foreground)]/60">
          Last Update: 18:02 UTC
        </span>

        {/* Auth buttons */}
        <div className="flex items-center gap-2 border-l border-[var(--border)] pl-6">
          {user ? (
            <>
              <span className="text-sm text-[var(--foreground)]/80 truncate max-w-[120px]">
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
