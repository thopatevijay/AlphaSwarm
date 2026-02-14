"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { AgentStatus } from "../lib/types";
import { AGENT_CONFIG } from "../lib/utils";

function AgentCard({ agent }: { agent: AgentStatus }) {
  const cfg = AGENT_CONFIG[agent.name];
  const statusColors: Record<string, string> = {
    idle: "bg-gray-700",
    analyzing: "bg-blue-500 animate-pulse",
    debating: "bg-purple-500 animate-pulse",
    voting: "bg-amber-500 animate-pulse",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</span>
          <span
            className={`w-2 h-2 rounded-full ${statusColors[agent.status] || "bg-gray-700"}`}
          />
        </div>
        <span className="text-xs text-gray-500 uppercase">{agent.status}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{cfg.strategy} Strategy</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/50 rounded px-2 py-1.5">
          <span className="text-gray-500 block">Analyses</span>
          <span className="text-gray-300 font-medium">{agent.totalAnalyses}</span>
        </div>
        <div className="bg-gray-800/50 rounded px-2 py-1.5">
          <span className="text-gray-500 block">Avg Score</span>
          <span className="text-gray-300 font-medium">
            {agent.avgScore ? agent.avgScore.toFixed(1) : "—"}
          </span>
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

  // Show default agents if backend hasn't responded
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
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
        Agent Syndicate
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {displayAgents.map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  );
}
