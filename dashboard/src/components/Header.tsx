"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { HealthData } from "../lib/types";
import { shortenAddress } from "../lib/utils";

export default function Header() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.health();
        setHealth(data);
      } catch {
        /* backend not running */
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            <span className="text-xl font-bold text-amber-400 tracking-tight">
              Alpha
            </span>
            <span className="text-xl font-bold text-gray-100 tracking-tight">
              Swarm
            </span>
          </div>
          <span className="hidden sm:inline-flex text-[10px] text-gray-500 border border-gray-700/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Autonomous Venture Syndicate
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs">
          {health ? (
            <>
              {/* Live indicator */}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-green-400 font-semibold text-[11px]">
                  LIVE
                </span>
              </div>

              {/* Network */}
              <div className="hidden md:flex items-center gap-1.5 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500/80" />
                <span className="text-gray-300 capitalize">{health.network}</span>
              </div>

              {/* Wallet */}
              <div className="hidden lg:block">
                <span className="text-gray-500 font-mono text-[11px]">
                  {shortenAddress(health.wallet)}
                </span>
              </div>

              {/* Balance */}
              <div className="font-semibold text-amber-400">
                {health.balance}
              </div>

              {/* Mode badges */}
              {health.mockLLM && (
                <span className="badge bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  MOCK
                </span>
              )}
              {health.dryRun && (
                <span className="badge bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  DRY RUN
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/80" />
              <span className="text-red-400 font-medium">OFFLINE</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
