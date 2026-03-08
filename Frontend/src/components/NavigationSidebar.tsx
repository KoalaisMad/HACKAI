"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Fuel, X, TrendingUp } from "lucide-react";

type NavigationSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NavigationSidebar({ isOpen, onClose }: NavigationSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
      description: "Global risk monitoring",
    },
    {
      name: "Gas Stations",
      path: "/gas-stations",
      icon: Fuel,
      description: "Nearby gas prices & locations",
    },
    {
      name: "Solana Predictions",
      path: "/solana-predictions",
      icon: TrendingUp,
      description: "Blockchain-based price forecasts",
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[var(--card-bg)] border-r border-[var(--border)] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]">
                <span className="text-lg font-bold">C</span>
              </div>
              <h2 className="text-xl font-semibold text-white">StraitWatch</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[var(--foreground)]/70 transition hover:bg-[var(--border)] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-start gap-4 rounded-lg p-4 transition ${
                      isActive
                        ? "bg-[var(--accent-blue)]/20 border border-[var(--accent-blue)] text-white"
                        : "border border-transparent text-[var(--foreground)]/80 hover:bg-[var(--border)] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 flex-shrink-0 ${
                        isActive ? "text-[var(--accent-blue)]" : "text-[var(--foreground)]/60"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-xs text-[var(--foreground)]/60 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-[var(--border)] p-4">
            <p className="text-xs text-[var(--foreground)]/60 text-center">
              © 2026 StraitWatch. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
