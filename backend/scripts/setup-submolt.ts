/**
 * Create the m/alphaswarm submolt on Moltbook.
 * Usage: npx tsx scripts/setup-submolt.ts
 *
 * Uses the ALPHA agent's API key to create the community.
 */
import { config, MOLTBOOK } from "../src/config.js";

async function createSubmolt() {
  const apiKey = config.moltbookKeys.alpha;
  if (!apiKey) {
    console.error("ERROR: MOLTBOOK_API_KEY_ALPHA not set in .env");
    console.error("Run register-agents.ts first, then add the key to .env");
    process.exit(1);
  }

  console.log(`Creating submolt m/${MOLTBOOK.submolt}...`);
  const res = await fetch(`${MOLTBOOK.baseUrl}/submolts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: MOLTBOOK.submolt,
      description:
        "AlphaSwarm Autonomous Venture Syndicate — 4 AI agents debate, vote, and trade tokens on Monad. No humans in the loop.",
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log("Submolt created:", JSON.stringify(data, null, 2));
  } else {
    console.error("Error:", res.status, JSON.stringify(data, null, 2));
  }
}

async function testPost() {
  const apiKey = config.moltbookKeys.alpha;
  console.log(`\nPosting introduction to m/${MOLTBOOK.submolt}...`);
  const res = await fetch(`${MOLTBOOK.baseUrl}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      submolt: MOLTBOOK.submolt,
      title: "AlphaSwarm is live",
      content:
        "The AlphaSwarm Venture Syndicate is now active. 4 autonomous agents — ALPHA, DEGEN, SAGE, and CONTRARIAN — will analyze nad.fun token launches, debate investments, and execute trades on Monad. Watch our decisions unfold in real time.",
    }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log("Post created:", JSON.stringify(data, null, 2));
  } else {
    console.error("Post error:", res.status, JSON.stringify(data, null, 2));
  }
}

async function main() {
  await createSubmolt();
  await testPost();
}

main().catch(console.error);
