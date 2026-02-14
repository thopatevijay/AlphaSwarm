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
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-amber-400">Alpha</span>
            <span className="text-gray-100">Swarm</span>
          </div>
          <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
            Autonomous Venture Syndicate
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          {health ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
                <span className="text-green-400">LIVE</span>
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">Network:</span>{" "}
                <span className="text-gray-300">{health.network}</span>
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">Wallet:</span>{" "}
                <span className="text-gray-300">{shortenAddress(health.wallet)}</span>
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">Balance:</span>{" "}
                <span className="text-amber-400">{health.balance}</span>
              </div>
              {health.mockLLM && (
                <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">
                  MOCK
                </span>
              )}
              {health.dryRun && (
                <span className="text-xs bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded">
                  DRY RUN
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400">OFFLINE</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
