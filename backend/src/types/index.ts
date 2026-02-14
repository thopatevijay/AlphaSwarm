import { z } from "zod";

// Agent personas
export type AgentName = "alpha" | "degen" | "sage" | "contrarian";

// LLM analysis output from each agent
export const AgentAnalysisSchema = z.object({
  score: z.number().min(1).max(10),
  vote: z.enum(["YES", "NO"]),
  confidence: z.number().min(0).max(100),
  analysis: z.string(),
  criticalFlag: z.boolean().optional(), // Only CONTRARIAN uses this
});
export type AgentAnalysis = z.infer<typeof AgentAnalysisSchema>;

// Token data from nad.fun
export interface TokenInfo {
  id: string; // token contract address
  name: string;
  symbol: string;
  creator: string;
  imageUrl?: string;
  description?: string;
  graduated: boolean;
  createdAt?: string;
}

export interface TokenMarket {
  tokenId: string;
  price: string;
  priceUsd?: string;
  marketCap?: string;
  volume24h?: string;
  holders?: number;
  buyCount?: number;
  sellCount?: number;
}

export interface TokenMetrics {
  tokenId: string;
  timeframe: string;
  priceChange?: number;
  volumeChange?: number;
  buyVolume?: string;
  sellVolume?: string;
  netFlow?: string;
}

export interface ChartCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Vote result
export interface VoteResult {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  votes: Record<AgentName, AgentAnalysis>;
  weightedScore: number;
  yesCount: number;
  decision: "INVEST" | "PASS";
  criticalFlag: boolean;
  timestamp: number;
}

// Portfolio
export interface Holding {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string; // token amount
  buyPrice: string; // MON price at buy
  buyAmountMON: string; // MON spent
  currentPrice?: string;
  currentValueMON?: string;
  pnlPercent?: number;
  buyTxHash: string;
  sellTxHash?: string;
  status: "holding" | "sold" | "pending";
  boughtAt: number;
  soldAt?: number;
}

// Event log
export type EventType =
  | "token_discovered"
  | "analysis_started"
  | "analysis_complete"
  | "debate_posted"
  | "vote_complete"
  | "trade_executed"
  | "trade_failed"
  | "exit_triggered"
  | "portfolio_update"
  | "system";

export interface SwarmEvent {
  id?: number;
  type: EventType;
  agent?: AgentName;
  tokenId?: string;
  tokenName?: string;
  message: string;
  data?: string; // JSON stringified extra data
  timestamp: number;
}

// Moltbook
export interface MoltbookPost {
  id: string;
  title: string;
  content: string;
  submolt: string;
  author?: string;
  createdAt?: string;
}

export interface MoltbookComment {
  id: string;
  postId: string;
  content: string;
  parentId?: string;
  author?: string;
  createdAt?: string;
}

// Dashboard API responses
export interface FeedResponse {
  events: SwarmEvent[];
}

export interface PortfolioResponse {
  holdings: Holding[];
  totalValue: string;
  totalPnl: string;
}

export interface AgentsResponse {
  agents: {
    name: AgentName;
    status: "idle" | "analyzing" | "debating" | "voting";
    lastAction?: string;
    lastActionAt?: number;
    totalAnalyses: number;
    avgScore: number;
  }[];
}

export interface TokensResponse {
  tokens: {
    id: string;
    name: string;
    symbol: string;
    status: "discovered" | "analyzing" | "debated" | "invested" | "passed";
    weightedScore?: number;
    decision?: "INVEST" | "PASS";
    discoveredAt: number;
  }[];
}
