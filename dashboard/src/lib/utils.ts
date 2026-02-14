import type { AgentName } from "./types";

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function shortenTx(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export const AGENT_CONFIG: Record<AgentName, { label: string; color: string; emoji: string; strategy: string }> = {
  alpha: { label: "ALPHA", color: "text-blue-400", emoji: "chart_with_upwards_trend", strategy: "Quantitative" },
  degen: { label: "DEGEN", color: "text-green-400", emoji: "rocket", strategy: "Momentum" },
  sage: { label: "SAGE", color: "text-purple-400", emoji: "crystal_ball", strategy: "Fundamental" },
  contrarian: { label: "CONTRARIAN", color: "text-red-400", emoji: "shield", strategy: "Risk" },
};

export const EVENT_COLORS: Record<string, string> = {
  token_discovered: "border-l-yellow-500",
  analysis_started: "border-l-blue-500",
  analysis_complete: "border-l-indigo-500",
  debate_posted: "border-l-purple-500",
  vote_complete: "border-l-cyan-500",
  trade_executed: "border-l-green-500",
  trade_failed: "border-l-red-500",
  exit_triggered: "border-l-orange-500",
  system: "border-l-gray-500",
};
