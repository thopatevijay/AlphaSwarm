import dotenv from "dotenv";
dotenv.config();

const NETWORK = (process.env.NETWORK || "testnet") as "testnet" | "mainnet";

export const config = {
  network: NETWORK,
  mockLLM: process.env.MOCK_LLM === "true",
  dryRun: process.env.DRY_RUN === "true",
  port: parseInt(process.env.PORT || "3001", 10),

  // LLM
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",

  // Wallet
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,

  // Moltbook agent keys
  moltbookKeys: {
    alpha: process.env.MOLTBOOK_API_KEY_ALPHA || "",
    degen: process.env.MOLTBOOK_API_KEY_DEGEN || "",
    sage: process.env.MOLTBOOK_API_KEY_SAGE || "",
    contrarian: process.env.MOLTBOOK_API_KEY_CONTRARIAN || "",
  },

  // Nad.fun
  nadFunApiKey: process.env.NADFUN_API_KEY || "",
} as const;

export const MONAD = {
  testnet: {
    chainId: 10143,
    rpcUrl: "https://monad-testnet.drpc.org",
    apiUrl: "https://dev-api.nad.fun",
    DEX_ROUTER: "0x5D4a4f430cA3B1b2dB86B9cFE48a5316800F5fb2" as `0x${string}`,
    BONDING_CURVE_ROUTER: "0x865054F0F6A288adaAc30261731361EA7E908003" as `0x${string}`,
    LENS: "0xB056d79CA5257589692699a46623F901a3BB76f1" as `0x${string}`,
    CURVE: "0x1228b0dc9481C11D3071E7A924B794CfB038994e" as `0x${string}`,
    WMON: "0x5a4E0bFDeF88C9032CB4d24338C5EB3d3870BfDd" as `0x${string}`,
    explorer: "https://monad-testnet.socialscan.io",
  },
  mainnet: {
    chainId: 143,
    rpcUrl: "https://monad-mainnet.drpc.org",
    apiUrl: "https://api.nadapp.net",
    DEX_ROUTER: "0x0B79d71AE99528D1dB24A4148b5f4F865cc2b137" as `0x${string}`,
    BONDING_CURVE_ROUTER: "0x6F6B8F1a20703309951a5127c45B49b1CD981A22" as `0x${string}`,
    LENS: "0x7e78A8DE94f21804F7a17F4E8BF9EC2c872187ea" as `0x${string}`,
    CURVE: "0xA7283d07812a02AFB7C09B60f8896bCEA3F90aCE" as `0x${string}`,
    WMON: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A" as `0x${string}`,
    explorer: "https://monad.socialscan.io",
  },
} as const;

export const getNetwork = () => MONAD[config.network];

// Moltbook
export const MOLTBOOK = {
  baseUrl: "https://www.moltbook.com/api/v1",
  submolt: "alphaswarm",
} as const;

// Agent personas
export const AGENT_NAMES = ["alpha", "degen", "sage", "contrarian"] as const;
export type AgentName = (typeof AGENT_NAMES)[number];

// Trading defaults
export const TRADING = {
  maxBuyAmountMON: "0.1",      // Max MON per trade (testnet-safe)
  slippageBps: 100,             // 1% slippage
  deadlineSecs: 300,            // 5 min deadline
  takeProfitPct: 50,            // +50% exit
  stopLossPct: 30,              // -30% exit
  voteThreshold: 4.5,           // Weighted score threshold
  minYesVotes: 2,               // Minimum YES votes (majority weighted)
} as const;
