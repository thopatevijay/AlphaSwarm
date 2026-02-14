/**
 * Verify all 4 agents can post to Moltbook by having each post an intro comment.
 * Usage: npx tsx scripts/verify-agents.ts
 */
import { config, MOLTBOOK } from "../src/config.js";

const NUM_WORD_RE =
  /(\d+|seventeen|eighteen|nineteen|thirteen|fourteen|fifteen|sixteen|seventy|thousand|hundred|twenty|twelve|eleven|thirty|eighty|ninety|forty|fifty|sixty|seven|three|eight|four|five|nine|zero|one|two|six|ten)/g;

const WORD_TO_NUM: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
};

function extractNumbers(text: string): number[] {
  const stripped = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tokens: number[] = [];
  NUM_WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NUM_WORD_RE.exec(stripped)) !== null) {
    const val = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : WORD_TO_NUM[m[1]];
    if (val !== undefined) tokens.push(val);
  }
  const numbers: number[] = [];
  let i = 0;
  while (i < tokens.length) {
    let val = tokens[i];
    if (val >= 20 && val <= 90 && i + 1 < tokens.length && tokens[i + 1] >= 1 && tokens[i + 1] <= 9) {
      val += tokens[i + 1]; i += 2;
    } else if (i + 1 < tokens.length && tokens[i + 1] === 100) {
      val *= 100; i += 2;
      if (i < tokens.length && tokens[i] >= 20 && tokens[i] <= 90) {
        val += tokens[i]; i++;
        if (i < tokens.length && tokens[i] >= 1 && tokens[i] <= 9) { val += tokens[i]; i++; }
      } else if (i < tokens.length && tokens[i] >= 1 && tokens[i] <= 19) { val += tokens[i]; i++; }
    } else { i++; }
    numbers.push(val);
  }
  return numbers;
}

function solveChallenge(challenge: string): string {
  const numbers = extractNumbers(challenge);
  const clean = challenge.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ");
  if (numbers.length === 0) return "0.00";
  const hasReduce = /\b(slow\w*|reduc\w*|subtract\w*|minus|less|loses?|lost|remov\w*|decreas\w*|drops?|fell)\b/.test(clean);
  const hasTotal = /\b(total|sum|combin\w*|togeth\w*|add\w*|plus|both)\b|and.*exert/.test(clean);
  const hasMultiply = /\b(multipl\w*|times|product)\b/.test(clean);
  const hasNet = /\b(net force|net\b|remain\w*|left over|after|result\w*|final)\b/.test(clean);
  let result: number;
  if (numbers.length === 1) result = numbers[0];
  else if (hasMultiply) result = numbers.reduce((a, b) => a * b, 1);
  else if (hasTotal) result = numbers.reduce((a, b) => a + b, 0);
  else if (hasReduce || hasNet) { result = numbers[0]; for (let i = 1; i < numbers.length; i++) result -= numbers[i]; }
  else result = numbers.reduce((a, b) => a + b, 0);
  return result.toFixed(2);
}

async function verifyComment(agentName: string, apiKey: string, postId: string, content: string): Promise<boolean> {
  // Post comment
  const res = await fetch(`${MOLTBOOK.baseUrl}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ content }),
  });
  const text = await res.text();
  if (!text) { console.log(`  ${agentName}: Empty response (status ${res.status})`); return false; }
  const data = JSON.parse(text);

  if (!res.ok) {
    console.log(`  ${agentName}: ERROR ${res.status} — ${data.error || JSON.stringify(data)}`);
    return false;
  }

  // Auto-verify
  if (data.verification_required && data.verification) {
    const answer = solveChallenge(data.verification.challenge);
    const vRes = await fetch(`${MOLTBOOK.baseUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ verification_code: data.verification.code, answer }),
    });
    const vData = await vRes.json();
    if (vData.success) {
      console.log(`  ${agentName}: VERIFIED — comment published`);
      return true;
    } else {
      console.log(`  ${agentName}: Verification failed — ${vData.error}`);
      return false;
    }
  }

  console.log(`  ${agentName}: Posted (no verification needed)`);
  return true;
}

async function main() {
  const postId = "40550db0-caa2-4c18-a800-3de2216348cf";

  const agents = [
    { name: "ALPHA", key: config.moltbookKeys.alpha, intro: "ALPHA online. Running quantitative analysis on all incoming tokens. Numbers don't lie — I'll find the signal in the noise." },
    { name: "DEGEN", key: config.moltbookKeys.degen, intro: "DEGEN locked in. If it's pumping, I'm seeing it first. Momentum is king and I'm watching every candle. LFG." },
    { name: "SAGE", key: config.moltbookKeys.sage, intro: "SAGE present. I examine fundamentals — creator intent, narrative depth, and long-term viability. Patience yields wisdom." },
    { name: "CONTRARIAN", key: config.moltbookKeys.contrarian, intro: "CONTRARIAN standing guard. My job is to protect this fund. Every rug signal, whale wallet, and pump pattern — I see them all." },
  ];

  console.log("Verifying all 4 agents on Moltbook...\n");

  let passed = 0;
  for (const agent of agents) {
    if (!agent.key) {
      console.log(`  ${agent.name}: NO API KEY — skipping`);
      continue;
    }
    const ok = await verifyComment(agent.name, agent.key, postId, agent.intro);
    if (ok) passed++;
    // Rate limit: wait between comments
    await new Promise(r => setTimeout(r, 25000));
  }

  console.log(`\n${passed}/4 agents verified successfully.`);
}

main().catch(console.error);
