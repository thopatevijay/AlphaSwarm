"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { timeAgo } from "../lib/utils";

interface AnalyzedToken {
  token_id: string;
  token_name: string;
  token_symbol: string;
  weighted_score: number | null;
  decision: string | null;
  discovered_at: number;
  analyzed_at: number | null;
}

export default function TokenRadar() {
  const [tokens, setTokens] = useState<AnalyzedToken[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.tokens();
        setTokens(data.tokens);
      } catch {
        /* backend not running */
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Token Radar
        </h2>
        <span className="text-xs text-gray-500">{tokens.length} scanned</span>
      </div>

      {tokens.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-600">
          <p className="text-sm">Radar is scanning for new tokens...</p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-800/50">
          {tokens.map((token) => (
            <div
              key={token.token_id}
              className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-800/30"
            >
              <div className="min-w-0">
                <span className="text-sm text-gray-200 font-medium">
                  {token.token_name || "Unknown"}
                </span>
                {token.token_symbol && (
                  <span className="text-xs text-gray-500 ml-1">
                    ${token.token_symbol}
                  </span>
                )}
                <span className="text-xs text-gray-600 ml-2">
                  {timeAgo(token.discovered_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {token.weighted_score != null && (
                  <span className="text-xs text-gray-400">
                    {token.weighted_score.toFixed(1)}/10
                  </span>
                )}
                {token.decision ? (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      token.decision === "INVEST"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    {token.decision}
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded">
                    PENDING
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
