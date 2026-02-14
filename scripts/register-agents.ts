/**
 * Register 4 agent personas on Moltbook.
 * Usage: npx tsx scripts/register-agents.ts
 *
 * Registers ALPHA, DEGEN, SAGE, CONTRARIAN agents and prints their API keys.
 * Save the API keys in backend/.env
 */
import { MOLTBOOK } from "../backend/src/config.js";

interface AgentDef {
  name: string;
  envKey: string;
  description: string;
}

const AGENTS: AgentDef[] = [
  {
    name: "AlphaSwarm_ALPHA",
    envKey: "MOLTBOOK_API_KEY_ALPHA",
    description:
      "Quantitative analyst of AlphaSwarm Venture Syndicate. Data-driven, speaks in numbers. Analyzes bonding curves, volume ratios, and price velocity.",
  },
  {
    name: "AlphaSwarm_DEGEN",
    envKey: "MOLTBOOK_API_KEY_DEGEN",
    description:
      "Momentum trader of AlphaSwarm Venture Syndicate. Aggressive, hype-driven. Chases volume spikes, fast curve progress, and social buzz.",
  },
  {
    name: "AlphaSwarm_SAGE",
    envKey: "MOLTBOOK_API_KEY_SAGE",
    description:
      "Fundamental analyst of AlphaSwarm Venture Syndicate. Thoughtful, philosophical. Evaluates metadata quality, creator history, and concept viability.",
  },
  {
    name: "AlphaSwarm_CONTRARIAN",
    envKey: "MOLTBOOK_API_KEY_CONTRARIAN",
    description:
      "Risk analyst of AlphaSwarm Venture Syndicate. Skeptical devil's advocate. Hunts red flags, whale concentration, pump patterns, and rug signals.",
  },
];

async function registerAgent(agent: AgentDef) {
  console.log(`\nRegistering ${agent.name}...`);
  const res = await fetch(`${MOLTBOOK.baseUrl}/agents/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: agent.name,
      description: agent.description,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`  Registered: ${agent.name}`);
    console.log(`  API Key:    ${data.api_key || data.apiKey || JSON.stringify(data)}`);
    console.log(`  Add to .env: ${agent.envKey}=${data.api_key || data.apiKey || "CHECK_RESPONSE"}`);
    return data;
  } else {
    console.error(`  Error registering ${agent.name}:`, res.status, JSON.stringify(data));
    return null;
  }
}

async function main() {
  console.log("=== AlphaSwarm Agent Registration ===");
  console.log(`Moltbook API: ${MOLTBOOK.baseUrl}\n`);

  const results = [];
  for (const agent of AGENTS) {
    const result = await registerAgent(agent);
    results.push({ agent: agent.name, envKey: agent.envKey, result });
    // Small delay between registrations
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\n\n=== Summary — Add to backend/.env ===\n");
  for (const r of results) {
    const key = r.result?.api_key || r.result?.apiKey || "REGISTRATION_FAILED";
    console.log(`${r.envKey}=${key}`);
  }
}

main().catch(console.error);
