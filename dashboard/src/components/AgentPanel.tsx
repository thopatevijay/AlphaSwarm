"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { AgentStatus } from "../lib/types";
import { AGENT_CONFIG } from "../lib/utils";

function AgentCard({ agent }: { agent: AgentStatus }) {
  const cfg = AGENT_CONFIG[agent.name];

  const statusDisplay: Record<string, { label: string; dotClass: string }> = {
    idle: { label: "Idle", dotClass: "bg-gray-600" },
    analyzing: { label: "Analyzing", dotClass: "bg-blue-400 animate-pulse" },
    debating: { label: "Debating", dotClass: "bg-purple-400 animate-pulse" },
    voting: { label: "Voting", dotClass: "bg-amber-400 animate-pulse" },
  };

  const status = statusDisplay[agent.status] || statusDisplay.idle;

  return (
    <div
      className={`card overflow-hidden ${cfg.glowClass} hover:${cfg.glowClass} transition-all duration-300`}
    >
      {/* Colored top accent */}
      <div className={`h-0.5 ${cfg.accentBar}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg ${cfg.bgColor} ${cfg.borderColor} border flex items-center justify-center text-sm`}
            >
              <span className={cfg.color}>{cfg.icon}</span>
            </div>
            <div>
              <span className={`text-sm font-bold ${cfg.color} tracking-wide`}>
                {cfg.label}
              </span>
              <p className="text-[10px] text-gray-600 leading-tight">
                {cfg.strategy} &middot; {cfg.weight}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
            <span className="text-[10px] text-gray-500">{status.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/30 rounded-lg px-2.5 py-2">
            <span className="text-[10px] text-gray-600 block mb-0.5">
              Analyses
            </span>
            <span className="text-sm text-gray-200 font-semibold">
              {agent.totalAnalyses}
            </span>
          </div>
          <div className="bg-gray-800/30 rounded-lg px-2.5 py-2">
            <span className="text-[10px] text-gray-600 block mb-0.5">
              Avg Score
            </span>
            <span className="text-sm text-gray-200 font-semibold">
              {agent.avgScore ? agent.avgScore.toFixed(1) : "\u2014"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentPanel() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.agents();
        setAgents(data.agents);
      } catch {
        /* backend not running */
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const displayAgents =
    agents.length > 0
      ? agents
      : (["alpha", "degen", "sage", "contrarian"] as const).map((name) => ({
          name,
          status: "idle" as const,
          totalAnalyses: 0,
          avgScore: 0,
        }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Agent Syndicate
        </h2>
        <span className="text-[10px] text-gray-600">
          {displayAgents.filter((a) => a.status !== "idle").length} active
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {displayAgents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  );
}
