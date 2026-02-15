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

export const AGENT_CONFIG: Record<
  AgentName,
  {
    label: string;
    color: string;
    bgColor: string;
    accentBar: string;
    borderColor: string;
    glowClass: string;
    strategy: string;
    icon: string;
    weight: string;
  }
> = {
  alpha: {
    label: "ALPHA",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    accentBar: "bg-blue-500/40",
    borderColor: "border-blue-500/30",
    glowClass: "glow-alpha",
    strategy: "Quantitative",
    icon: "\u0394", // Delta symbol
    weight: "1.0x",
  },
  degen: {
    label: "DEGEN",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    accentBar: "bg-emerald-500/40",
    borderColor: "border-emerald-500/30",
    glowClass: "glow-degen",
    strategy: "Momentum",
    icon: "\u26A1", // Lightning
    weight: "0.8x",
  },
  sage: {
    label: "SAGE",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    accentBar: "bg-purple-500/40",
    borderColor: "border-purple-500/30",
    glowClass: "glow-sage",
    strategy: "Fundamental",
    icon: "\u2609", // Sun/eye symbol
    weight: "1.0x",
  },
  contrarian: {
    label: "CONTRARIAN",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    accentBar: "bg-red-500/40",
    borderColor: "border-red-500/30",
    glowClass: "glow-contrarian",
    strategy: "Risk",
    icon: "\u2622", // Shield-like
    weight: "1.2x",
  },
};

export const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  token_discovered: { icon: "\u25C9", color: "text-amber-400" },    // target
  analysis_started: { icon: "\u25B6", color: "text-blue-400" },     // play
  analysis_complete: { icon: "\u2713", color: "text-indigo-400" },  // check
  debate_posted: { icon: "\u2667", color: "text-purple-400" },      // club
  vote_complete: { icon: "\u2605", color: "text-cyan-400" },        // star
  trade_executed: { icon: "\u2191", color: "text-green-400" },      // arrow up
  trade_failed: { icon: "\u2717", color: "text-red-400" },          // x
  exit_triggered: { icon: "\u2193", color: "text-orange-400" },     // arrow down
  system: { icon: "\u2699", color: "text-gray-400" },               // gear
};

export const EVENT_COLORS: Record<string, string> = {
  token_discovered: "border-l-amber-500/70",
  analysis_started: "border-l-blue-500/70",
  analysis_complete: "border-l-indigo-500/70",
  debate_posted: "border-l-purple-500/70",
  vote_complete: "border-l-cyan-500/70",
  trade_executed: "border-l-green-500/70",
  trade_failed: "border-l-red-500/70",
  exit_triggered: "border-l-orange-500/70",
  system: "border-l-gray-600/70",
};
