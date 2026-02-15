import express from "express";
import cors from "cors";
import { config, getNetwork, MOLTBOOK } from "./config.js";
import { Orchestrator } from "./core/orchestrator.js";
import { Scheduler } from "./core/scheduler.js";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize orchestrator
const orchestrator = new Orchestrator();
const scheduler = new Scheduler(orchestrator);

// Health check
app.get("/api/health", async (_req, res) => {
  const network = getNetwork();
  let balance = "unknown";
  try {
    balance = await orchestrator.getBalance();
  } catch { /* wallet not configured */ }

  res.json({
    status: "ok",
    version: "v4",
    name: "AlphaSwarm",
    network: config.network,
    chainId: network.chainId,
    wallet: orchestrator.getWalletAddress(),
    balance: `${balance} MON`,
    mockLLM: config.mockLLM,
    dryRun: config.dryRun,
    moltbook: MOLTBOOK.baseUrl,
  });
});

// Dashboard API routes
app.get("/api/feed", (_req, res) => {
  const limit = parseInt((_req.query.limit as string) || "50", 10);
  const events = orchestrator.getRecentEvents(limit);
  res.json({ events });
});

app.get("/api/portfolio", (_req, res) => {
  const data = orchestrator.getPortfolioData();
  res.json(data);
});

app.get("/api/agents", (_req, res) => {
  const agents = orchestrator.getAgentStatus();
  res.json({ agents });
});

app.get("/api/tokens", (_req, res) => {
  const tokens = orchestrator.getAnalyzedTokens();
  res.json({ tokens });
});

app.get("/api/tokens/:id", (_req, res) => {
  const token = orchestrator.getAnalyzedToken(_req.params.id);
  if (!token) {
    res.status(404).json({ error: "Token not found" });
    return;
  }
  res.json({ token });
});

// Manual trigger: analyze specific tokens
app.post("/api/analyze", async (req, res) => {
  const { tokenIds } = req.body;
  if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
    res.status(400).json({ error: "tokenIds array required" });
    return;
  }
  try {
    const results = await orchestrator.analyzeTokens(tokenIds);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Manual trade: buy a token directly
app.post("/api/trade/buy", async (req, res) => {
  const { tokenId, amount } = req.body;
  if (!tokenId) {
    res.status(400).json({ error: "tokenId required" });
    return;
  }
  try {
    const result = await orchestrator.manualBuy(tokenId, amount || "0.1");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Manual trade: sell a token directly
app.post("/api/trade/sell", async (req, res) => {
  const { tokenId } = req.body;
  if (!tokenId) {
    res.status(400).json({ error: "tokenId required" });
    return;
  }
  try {
    const result = await orchestrator.manualSell(tokenId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Add tokens to the scanner queue
app.post("/api/queue", (req, res) => {
  const { tokenIds } = req.body;
  if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
    res.status(400).json({ error: "tokenIds array required" });
    return;
  }
  scheduler.addTokens(tokenIds);
  res.json({ queued: tokenIds.length });
});

app.listen(config.port, () => {
  console.log(`\nAlphaSwarm backend running on http://localhost:${config.port}`);
  console.log(`   Network: ${config.network} (chain ${getNetwork().chainId})`);
  console.log(`   Wallet:  ${orchestrator.getWalletAddress()}`);
  console.log(`   Mock LLM: ${config.mockLLM}`);
  console.log(`   Dry Run: ${config.dryRun}`);
  console.log(`   Moltbook: ${MOLTBOOK.baseUrl}\n`);

  // Start scheduler
  scheduler.start();
});
