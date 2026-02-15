"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "../lib/api";
import type { AgentName, AgentAnalysis } from "../lib/types";
import { AGENT_CONFIG, timeAgo } from "../lib/utils";

interface TokenDebateRaw {
  token_id: string;
  token_name: string;
  token_symbol: string;
  weighted_score: number | null;
  decision: string | null;
  votes_json?: string;
  votes?: Record<AgentName, AgentAnalysis> | null;
  analyzed_at: number | null;
}

interface TokenDebate {
  token_id: string;
  token_name: string;
  token_symbol: string;
  weighted_score: number | null;
  decision: string | null;
  votes: Record<AgentName, AgentAnalysis> | null;
  analyzed_at: number | null;
}

const AGENT_ORDER: AgentName[] = ["alpha", "degen", "sage", "contrarian"];

const VOTE_WEIGHTS: Record<AgentName, number> = {
  alpha: 1.0,
  degen: 0.8,
  sage: 1.0,
  contrarian: 1.2,
};

// Build a fingerprint string to detect real data changes
function debateFingerprint(debates: TokenDebate[]): string {
  return debates.map((d) => `${d.token_id}:${d.weighted_score}:${d.decision}`).join("|");
}

export default function DebateStream() {
  const [debates, setDebates] = useState<TokenDebate[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fingerprintRef = useRef("");
  const expandedInitRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const data = await api.tokens();
      // Parse votes_json string into votes object, filter to analyzed tokens
      const withVotes: TokenDebate[] = (data.tokens || [])
        .map((t: TokenDebateRaw) => {
          let votes = t.votes || null;
          if (!votes && t.votes_json) {
            try { votes = JSON.parse(t.votes_json); } catch { /* malformed */ }
          }
          return { ...t, votes } as TokenDebate;
        })
        .filter((t: TokenDebate) => t.votes && Object.keys(t.votes).length > 0)
        .sort(
          (a: TokenDebate, b: TokenDebate) =>
            (b.analyzed_at || 0) - (a.analyzed_at || 0)
        );

      // Only update state if data actually changed
      const fp = debateFingerprint(withVotes);
      if (fp !== fingerprintRef.current) {
        fingerprintRef.current = fp;
        setDebates(withVotes);
      }

      // Auto-expand the latest debate on first load only
      if (withVotes.length > 0 && !expandedInitRef.current) {
        expandedInitRef.current = true;
        setExpandedId(withVotes[0].token_id);
      }
    } catch {
      /* backend offline */
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const yesCount = (votes: Record<AgentName, AgentAnalysis>) =>
    AGENT_ORDER.filter((n) => votes[n]?.vote === "YES").length;

  return (
    <div className="card overflow-hidden">
      {/* Section header */}
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Agent Debates
          </h2>
          {debates.length > 0 && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-40" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500" />
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-600 tabular-nums">
          {debates.length} debates
        </span>
      </div>

      {debates.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <div className="text-2xl text-gray-700 mb-2">&middot;&middot;&middot;</div>
          <p className="text-sm text-gray-600 mb-1">No debates yet</p>
          <p className="text-xs text-gray-700">
            Agents will debate here once tokens are analyzed...
          </p>
        </div>
      ) : (
        <div className="max-h-[620px] overflow-y-auto">
          {debates.map((debate) => {
            const isExpanded = expandedId === debate.token_id;
            const isInvest = debate.decision === "INVEST";
            const score = debate.weighted_score ?? 0;

            return (
              <div
                key={debate.token_id}
                className="border-b border-gray-800/30 last:border-b-0"
              >
                {/* Thread header — clickable */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : debate.token_id)
                  }
                  className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Decision pill */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                        isInvest
                          ? "bg-green-500/10 border-green-500/25"
                          : debate.decision
                            ? "bg-gray-500/10 border-gray-500/25"
                            : "bg-amber-500/10 border-amber-500/25"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          isInvest
                            ? "text-green-400"
                            : debate.decision
                              ? "text-gray-500"
                              : "text-amber-500"
                        }`}
                      >
                        {isInvest ? "\u2191" : debate.decision ? "\u2013" : "?"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[13px] text-gray-200 font-medium truncate">
                          {debate.token_name}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          ${debate.token_symbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {debate.votes && (
                          <span className="text-[10px] text-gray-600">
                            {yesCount(debate.votes)}/4 YES
                          </span>
                        )}
                        {debate.analyzed_at && (
                          <span className="text-[10px] text-gray-700">
                            {timeAgo(debate.analyzed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        score >= 4.5 ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {score.toFixed(1)}
                    </span>
                    <span
                      className={`badge border text-[10px] ${
                        isInvest
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : debate.decision
                            ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}
                    >
                      {debate.decision || "PENDING"}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded debate thread */}
                {isExpanded && debate.votes && (
                  <div className="px-5 pb-4 space-y-3">
                    {/* Agent messages as conversation */}
                    {AGENT_ORDER.map((agentName) => {
                      const analysis = debate.votes![agentName];
                      if (!analysis) return null;
                      const cfg = AGENT_CONFIG[agentName];
                      const agentScore = analysis.score;
                      const scorePercent = Math.min(
                        (agentScore / 10) * 100,
                        100
                      );

                      return (
                        <div key={agentName} className="flex items-start gap-3">
                          {/* Agent avatar */}
                          <div
                            className={`w-7 h-7 rounded-lg ${cfg.bgColor} ${cfg.borderColor} border flex items-center justify-center flex-shrink-0 mt-0.5`}
                          >
                            <span className={`${cfg.color} text-xs`}>
                              {cfg.icon}
                            </span>
                          </div>

                          {/* Message bubble */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[11px] font-bold ${cfg.color} tracking-wide`}
                              >
                                {cfg.label}
                              </span>
                              <span className="text-[9px] text-gray-700">
                                {cfg.strategy} &middot; {VOTE_WEIGHTS[agentName]}
                                x
                              </span>
                              <span
                                className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                  analysis.vote === "YES"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {analysis.vote}
                              </span>
                            </div>

                            <div className="bg-gray-800/30 rounded-lg rounded-tl-none px-3.5 py-2.5 border border-gray-800/40">
                              <p className="text-[12px] text-gray-400 leading-relaxed">
                                {analysis.analysis}
                              </p>

                              {/* Score + Confidence bar */}
                              <div className="flex items-center gap-2.5 mt-2.5 pt-2 border-t border-gray-800/30">
                                <div className="flex-1 h-1 bg-gray-800/60 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      agentScore >= 7
                                        ? "bg-gradient-to-r from-green-500/80 to-emerald-400/80"
                                        : agentScore >= 4
                                          ? "bg-gradient-to-r from-amber-500/80 to-yellow-400/80"
                                          : "bg-gradient-to-r from-red-500/80 to-red-400/80"
                                    }`}
                                    style={{ width: `${scorePercent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-500 tabular-nums font-semibold">
                                  {agentScore}/10
                                </span>
                                <span className="text-[9px] text-gray-600 tabular-nums">
                                  {analysis.confidence}% conf
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Verdict bar */}
                    <div
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${
                        isInvest
                          ? "bg-green-500/5 border-green-500/15"
                          : "bg-gray-500/5 border-gray-700/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                          Verdict
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isInvest ? "text-green-400" : "text-gray-500"
                          }`}
                        >
                          {debate.decision}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-600">
                          YES:{" "}
                          <span className="text-green-400 font-semibold">
                            {yesCount(debate.votes)}
                          </span>
                          /4
                        </span>
                        <span className="text-[10px] text-gray-600">
                          Score:{" "}
                          <span className="text-gray-300 font-semibold">
                            {score.toFixed(1)}
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-700">
                          Threshold: 4.5
                        </span>
                      </div>
                    </div>
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
