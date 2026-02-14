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
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Portfolio
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500 mr-1">Value:</span>
            <span className="text-amber-400 font-medium">{totalValue} MON</span>
          </div>
          <div>
            <span className="text-gray-500 mr-1">P&L:</span>
            <span
              className={`font-medium ${pnlNum > 0 ? "text-green-400" : pnlNum < 0 ? "text-red-400" : "text-gray-400"}`}
            >
              {pnlNum > 0 ? "+" : ""}
              {totalPnl}%
            </span>
          </div>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-600">
          <p className="text-sm">No holdings yet. The syndicate is scouting...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left px-4 py-2">Token</th>
                <th className="text-right px-4 py-2">Invested</th>
                <th className="text-right px-4 py-2">Current</th>
                <th className="text-right px-4 py-2">P&L</th>
                <th className="text-right px-4 py-2">Status</th>
                <th className="text-right px-4 py-2">Tx</th>
                <th className="text-right px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {holdings.map((h) => {
                const pnl = h.pnlPercent ?? 0;
                return (
                  <tr key={h.tokenId} className="hover:bg-gray-800/30">
                    <td className="px-4 py-2">
                      <span className="text-gray-200 font-medium">{h.tokenName}</span>
                      <span className="text-gray-500 ml-1 text-xs">${h.tokenSymbol}</span>
                    </td>
                    <td className="text-right px-4 py-2 text-gray-400">
                      {h.buyAmountMON} MON
                    </td>
                    <td className="text-right px-4 py-2 text-gray-300">
                      {h.currentValueMON || "—"} MON
                    </td>
                    <td
                      className={`text-right px-4 py-2 font-medium ${pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : "text-gray-500"}`}
                    >
                      {pnl > 0 ? "+" : ""}
                      {pnl.toFixed(1)}%
                    </td>
                    <td className="text-right px-4 py-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          h.status === "holding"
                            ? "bg-blue-900/50 text-blue-400"
                            : h.status === "sold"
                              ? "bg-gray-800 text-gray-400"
                              : "bg-yellow-900/50 text-yellow-400"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="text-right px-4 py-2 text-xs text-gray-500 font-mono">
                      {shortenTx(h.buyTxHash)}
                    </td>
                    <td className="text-right px-4 py-2 text-xs text-gray-600">
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
