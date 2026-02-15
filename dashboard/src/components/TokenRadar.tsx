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
    <div className="card overflow-hidden">
      <div className="section-header justify-between">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Token Radar
        </h2>
        <span className="text-[10px] text-gray-600 tabular-nums">
          {tokens.length} scanned
        </span>
      </div>

      {tokens.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-2xl text-gray-700 mb-2">&middot;&middot;&middot;</div>
          <p className="text-sm text-gray-600">
            Radar is scanning for new tokens...
          </p>
        </div>
      ) : (
        <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-800/30">
          {tokens.map((token) => {
            const score = token.weighted_score ?? 0;
            const scorePercent = Math.min((score / 10) * 100, 100);
            const isInvest = token.decision === "INVEST";

            return (
              <div
                key={token.token_id}
                className="px-5 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex items-baseline gap-1.5">
                    <span className="text-[13px] text-gray-200 font-medium truncate">
                      {token.token_name || "Unknown"}
                    </span>
                    {token.token_symbol && (
                      <span className="text-[10px] text-gray-600">
                        ${token.token_symbol}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {token.decision ? (
                      <span
                        className={`badge border ${
                          isInvest
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }`}
                      >
                        {token.decision}
                      </span>
                    ) : (
                      <span className="badge border bg-amber-500/10 text-amber-500 border-amber-500/20">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>

                {/* Score bar */}
                {token.weighted_score != null && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full animate-fill transition-all ${
                          score >= 5.5
                            ? "bg-gradient-to-r from-green-500/80 to-emerald-400/80"
                            : score >= 4
                              ? "bg-gradient-to-r from-amber-500/80 to-yellow-400/80"
                              : "bg-gradient-to-r from-red-500/80 to-red-400/80"
                        }`}
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 tabular-nums w-8 text-right">
                      {score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-700 tabular-nums">
                      {timeAgo(token.discovered_at)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
