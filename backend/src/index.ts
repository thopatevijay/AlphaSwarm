import express from "express";
import cors from "cors";
import { config, getNetwork, MOLTBOOK } from "./config.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  const network = getNetwork();
  res.json({
    status: "ok",
    name: "AlphaSwarm",
    network: config.network,
    chainId: network.chainId,
    mockLLM: config.mockLLM,
    dryRun: config.dryRun,
    moltbook: MOLTBOOK.baseUrl,
  });
});

// Placeholder routes — will be implemented in later phases
app.get("/api/feed", (_req, res) => res.json({ events: [] }));
app.get("/api/portfolio", (_req, res) => res.json({ holdings: [], totalValue: "0" }));
app.get("/api/agents", (_req, res) => res.json({ agents: [] }));
app.get("/api/tokens", (_req, res) => res.json({ tokens: [] }));

app.listen(config.port, () => {
  console.log(`\n🐝 AlphaSwarm backend running on http://localhost:${config.port}`);
  console.log(`   Network: ${config.network} (chain ${getNetwork().chainId})`);
  console.log(`   Mock LLM: ${config.mockLLM}`);
  console.log(`   Dry Run: ${config.dryRun}\n`);
});
