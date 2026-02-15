export type AgentName = "alpha" | "degen" | "sage" | "contrarian";

export interface SwarmEvent {
  id?: number;
  type: string;
  agent?: AgentName;
  token_id?: string;
  token_name?: string;
  message: string;
  data?: string;
  timestamp: number;
}

export interface Holding {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string;
  buyPrice: string;
  buyAmountMON: string;
  currentPrice?: string;
  currentValueMON?: string;
  pnlPercent?: number;
  buyTxHash: string;
  sellTxHash?: string;
  status: "holding" | "sold" | "pending";
  boughtAt: number;
  soldAt?: number;
}

export interface AgentStatus {
  name: AgentName;
  status: "idle" | "analyzing" | "debating" | "voting";
  lastAction?: string;
  lastActionAt?: number;
  totalAnalyses: number;
  avgScore: number;
}

export interface AgentAnalysis {
  score: number;
  vote: "YES" | "NO";
  confidence: number;
  analysis: string;
  criticalFlag?: boolean;
}

export interface AnalyzedTokenDetail {
  token_id: string;
  token_name: string;
  token_symbol: string;
  weighted_score: number | null;
  decision: string | null;
  votes: Record<AgentName, AgentAnalysis> | null;
  discovered_at: number;
  analyzed_at: number | null;
}

export interface HealthData {
  status: string;
  name: string;
  network: string;
  chainId: number;
  wallet: string;
  balance: string;
  mockLLM: boolean;
  dryRun: boolean;
}
