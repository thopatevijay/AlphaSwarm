"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { AgentName, AgentAnalysis } from "../lib/types";
import { AGENT_CONFIG } from "../lib/utils";

interface DebateViewProps {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  onClose: () => void;
}

const VOTE_WEIGHTS: Record<AgentName, number> = {
  alpha: 1.0,
  degen: 0.8,
  sage: 1.0,
  contrarian: 1.2,
};

const AGENT_ORDER: AgentName[] = ["alpha", "degen", "sage", "contrarian"];

export default function DebateView({
  tokenId,
  tokenName,
  tokenSymbol,
  onClose,
}: DebateViewProps) {
  const [votes, setVotes] = useState<Record<AgentName, AgentAnalysis> | null>(
    null
  );
  const [weightedScore, setWeightedScore] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .tokenDetail(tokenId)
      .then((data) => {
        if (data.token) {
          setVotes(data.token.votes);
          setWeightedScore(data.token.weighted_score);
          setDecision(data.token.decision);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tokenId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const isInvest = decision === "INVEST";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-gray-100">
                {tokenName}
              </h2>
              <span className="text-sm text-gray-500">${tokenSymbol}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {weightedScore != null && (
                <span className="text-xs text-gray-400">
                  Score:{" "}
                  <span className="text-gray-200 font-semibold">
                    {weightedScore.toFixed(1)}
                  </span>
                  /10
                </span>
              )}
              {decision && (
                <span
                  className={`badge border text-[10px] ${
                    isInvest
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                  }`}
                >
                  {decision}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300 transition-colors text-xl leading-none px-2"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600 animate-pulse">
                Loading debate...
              </div>
            </div>
          ) : !votes ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-600">
                Analysis pending &mdash; agents haven&apos;t debated this token
                yet.
              </p>
            </div>
          ) : (
            <>
              {/* Agent cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AGENT_ORDER.map((name) => {
                  const analysis = votes[name];
                  if (!analysis) return null;
                  const cfg = AGENT_CONFIG[name];
                  const score = analysis.score;
                  const scorePercent = Math.min((score / 10) * 100, 100);

                  return (
                    <div
                      key={name}
                      className={`card overflow-hidden ${cfg.glowClass}`}
                    >
                      <div className={`h-0.5 ${cfg.accentBar}`} />
                      <div className="p-4">
                        {/* Agent header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg ${cfg.bgColor} ${cfg.borderColor} border flex items-center justify-center text-xs`}
                            >
                              <span className={cfg.color}>{cfg.icon}</span>
                            </div>
                            <div>
                              <span
                                className={`text-xs font-bold ${cfg.color} tracking-wide`}
                              >
                                {cfg.label}
                              </span>
                              <p className="text-[9px] text-gray-600">
                                {cfg.strategy} &middot; {VOTE_WEIGHTS[name]}x
                              </p>
                            </div>
                          </div>
                          <span
                            className={`badge border text-[10px] ${
                              analysis.vote === "YES"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {analysis.vote}
                          </span>
                        </div>

                        {/* Score + Confidence */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex-1 h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                score >= 7
                                  ? "bg-gradient-to-r from-green-500/80 to-emerald-400/80"
                                  : score >= 4
                                    ? "bg-gradient-to-r from-amber-500/80 to-yellow-400/80"
                                    : "bg-gradient-to-r from-red-500/80 to-red-400/80"
                              }`}
                              style={{ width: `${scorePercent}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-400 tabular-nums font-semibold">
                            {score}/10
                          </span>
                          <span className="text-[10px] text-gray-600 tabular-nums">
                            {analysis.confidence}%
                          </span>
                        </div>

                        {/* Analysis text */}
                        <p className="text-[12px] text-gray-400 leading-relaxed">
                          {analysis.analysis}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Vote Summary */}
              <div className="mt-5 pt-4 border-t border-gray-800/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                    Vote Summary
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500">
                      YES:{" "}
                      <span className="text-green-400 font-semibold">
                        {
                          AGENT_ORDER.filter((n) => votes[n]?.vote === "YES")
                            .length
                        }
                      </span>
                      /4
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Weighted:{" "}
                      <span className="text-gray-200 font-semibold">
                        {weightedScore?.toFixed(1) ?? "?"}
                      </span>
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Threshold:{" "}
                      <span className="text-gray-400">5.5</span>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
