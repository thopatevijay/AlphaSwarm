"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Holding } from "../lib/types";
import { shortenTx, timeAgo } from "../lib/utils";

export default function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [totalValue, setTotalValue] = useState("0");
  const [totalPnl, setTotalPnl] = useState("0");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.portfolio();
        setHoldings(data.holdings);
        setTotalValue(data.totalValue);
        setTotalPnl(data.totalPnl);
      } catch {
        /* backend not running */
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const pnlNum = parseFloat(totalPnl);

  return (
    <div className="card overflow-hidden">
      <div className="section-header justify-between">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Portfolio
        </h2>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">Value</span>
            <span className="text-amber-400 font-semibold tabular-nums">
              {totalValue} MON
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600">P&L</span>
            <span
              className={`font-semibold tabular-nums ${pnlNum > 0 ? "text-green-400" : pnlNum < 0 ? "text-red-400" : "text-gray-500"}`}
            >
              {pnlNum > 0 ? "+" : ""}
              {totalPnl}%
            </span>
          </div>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-2xl text-gray-700 mb-2">&middot;&middot;&middot;</div>
          <p className="text-sm text-gray-600">
            No holdings yet. The syndicate is scouting...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-gray-600 uppercase tracking-wider">
                <th className="text-left px-5 py-2.5 font-medium">Token</th>
                <th className="text-right px-4 py-2.5 font-medium">
                  Invested
                </th>
                <th className="text-right px-4 py-2.5 font-medium">
                  Current
                </th>
                <th className="text-right px-4 py-2.5 font-medium">P&L</th>
                <th className="text-right px-4 py-2.5 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 font-medium hidden sm:table-cell">
                  Tx
                </th>
                <th className="text-right px-5 py-2.5 font-medium hidden md:table-cell">
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {holdings.map((h) => {
                const pnl = h.pnlPercent ?? 0;
                return (
                  <tr
                    key={h.tokenId}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="text-gray-200 font-medium text-[13px]">
                        {h.tokenName}
                      </span>
                      <span className="text-gray-600 ml-1.5">${h.tokenSymbol}</span>
                    </td>
                    <td className="text-right px-4 py-3 text-gray-500 tabular-nums">
                      {h.buyAmountMON} MON
                    </td>
                    <td className="text-right px-4 py-3 text-gray-300 tabular-nums">
                      {h.currentValueMON || "\u2014"} MON
                    </td>
                    <td
                      className={`text-right px-4 py-3 font-semibold tabular-nums ${pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : "text-gray-600"}`}
                    >
                      {pnl > 0 ? "+" : ""}
                      {pnl.toFixed(1)}%
                    </td>
                    <td className="text-right px-4 py-3">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="text-right px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-600 font-mono text-[10px]">
                        {shortenTx(h.buyTxHash)}
                      </span>
                    </td>
                    <td className="text-right px-5 py-3 text-gray-700 text-[10px] tabular-nums hidden md:table-cell">
                      {timeAgo(h.boughtAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    holding:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
    sold: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    pending:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span
      className={`badge border ${styles[status] || styles.pending}`}
    >
      {status}
    </span>
  );
}
