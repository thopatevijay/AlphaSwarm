/**
 * Test the full pipeline step by step.
 * Usage: NETWORK=mainnet npx tsx scripts/test-pipeline.ts
 */
import { NadFunClient } from "../src/clients/NadFunClient.js";
import { config, getNetwork } from "../src/config.js";

const TOKEN = "0xb12F3D5400C0e798a3233A003639a24810837777"; // Clawpot

async function main() {
  const network = getNetwork();
  console.log(`Network: ${config.network} (${network.apiUrl})`);
  console.log(`Mock LLM: ${config.mockLlm}`);
  console.log(`Dry Run: ${config.dryRun}\n`);

  const client = new NadFunClient();

  // Step 1: Fetch token
  console.log("=== Step 1: Fetch Token ===");
  try {
    const token = await client.getToken(TOKEN);
    console.log("Token:", JSON.stringify(token, null, 2));
    console.log("graduated:", token.graduated, "\n");
  } catch (err) {
    console.error("Token fetch FAILED:", err);
    return;
  }

  // Step 2: Fetch market
  console.log("=== Step 2: Fetch Market ===");
  try {
    const market = await client.getMarket(TOKEN);
    console.log("Market:", JSON.stringify(market, null, 2), "\n");
  } catch (err) {
    console.error("Market fetch FAILED:", err);
  }

  // Step 3: Fetch metrics
  console.log("=== Step 3: Fetch Metrics ===");
  try {
    const metrics = await client.getMetrics(TOKEN);
    console.log("Metrics:", JSON.stringify(metrics, null, 2), "\n");
  } catch (err) {
    console.error("Metrics fetch FAILED:", err);
  }

  // Step 4: Full data
  console.log("=== Step 4: Full Token Data ===");
  try {
    const full = await client.getFullTokenData(TOKEN);
    console.log("Full data keys:", Object.keys(full));
    console.log("Token name:", full.token.name);
    console.log("Price:", full.market.price);
    console.log("Holders:", full.market.holders, "\n");
  } catch (err) {
    console.error("Full data FAILED:", err);
  }

  // Step 5: Test orchestrator analyze
  console.log("=== Step 5: Orchestrator ===");
  try {
    const { Orchestrator } = await import("../src/core/orchestrator.js");
    const orchestrator = new Orchestrator();
    console.log("Orchestrator created, calling analyzeTokens...");
    const results = await orchestrator.analyzeTokens([TOKEN]);
    console.log("Results:", JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Orchestrator FAILED:", err);
  }
}

main().catch(console.error);
