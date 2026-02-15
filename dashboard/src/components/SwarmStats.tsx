"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function SwarmStats() {
  const [stats, setStats] = useState({
    tokensScanned: 0,
    totalValue: "0",
    totalPnl: "0",
    tradesExecuted: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [tokens, portfolio, feed] = await Promise.all([
          api.tokens(),
          api.portfolio(),
          api.feed(200),
        ]);
        setStats({
          tokensScanned: tokens.tokens?.length ?? 0,
          totalValue: portfolio.totalValue || "0",
          totalPnl: portfolio.totalPnl || "0",
          tradesExecuted: feed.events?.filter(
            (e: any) => e.type === "trade_executed"
          ).length ?? 0,
        });
      } catch {
        /* backend not running */
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const pnl = parseFloat(stats.totalPnl);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        label="Tokens Scanned"
        value={String(stats.tokensScanned)}
        accent="text-amber-400"
      />
      <StatCard
        label="Trades"
        value={String(stats.tradesExecuted)}
        accent="text-blue-400"
      />
      <StatCard
        label="Portfolio"
        value={`${stats.totalValue} MON`}
        accent="text-purple-400"
      />
      <StatCard
        label="P&L"
        value={`${pnl > 0 ? "+" : ""}${stats.totalPnl}%`}
        accent={
          pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : "text-gray-500"
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card px-4 py-3.5 group">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${accent} tracking-tight`}>{value}</p>
    </div>
  );
}
