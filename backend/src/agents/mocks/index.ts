import type { AgentAnalysis, AgentName } from "../../types/index.js";

const alphaMocks: AgentAnalysis[] = [
  {
    score: 7,
    vote: "YES",
    confidence: 72,
    analysis:
      "Volume profile shows a 3.2x buy/sell ratio with healthy curve progression at 12.4%. Reserve mechanics indicate organic accumulation. Risk/reward ratio is favorable at current entry — price velocity of +18% in the last hour with sustained bid pressure.",
  },
  {
    score: 4,
    vote: "NO",
    confidence: 65,
    analysis:
      "The numbers don't support entry here. Buy/sell ratio has declined to 0.8x, curve progress stalled at 3.1%, and volume is down 62% from peak. Mathematical model suggests exhausted momentum — probability of further upside is below our threshold.",
  },
  {
    score: 8,
    vote: "YES",
    confidence: 85,
    analysis:
      "Exceptional volume metrics — 5.1x buy ratio, 47 unique buyers in the last hour, curve at 23.7% and accelerating. Price velocity is +41% with a tight Bollinger band. This is a textbook momentum setup with strong quantitative backing.",
  },
];

const degenMocks: AgentAnalysis[] = [
  {
    score: 8,
    vote: "YES",
    confidence: 78,
    analysis:
      "Bro this is COOKING. Volume just spiked 4x in the last 30 min, curve is ripping past 15%, and the name is memeable af. Aping in before this thing sends. The chart looks juicy and holders are stacking fast.",
  },
  {
    score: 3,
    vote: "NO",
    confidence: 55,
    analysis:
      "Nah this one's mid tbh. Volume flatlined, only 8 holders, and the concept is boring. NGMI. Not touching this with a ten foot pole — no momentum, no hype, no send potential.",
  },
  {
    score: 9,
    vote: "YES",
    confidence: 90,
    analysis:
      "ABSOLUTE BANGER. Volume is going parabolic, 67 holders already, curve at 31% and accelerating. This name is pure meme gold. If we don't ape now we're literally leaving money on the table. LFG.",
  },
];

const sageMocks: AgentAnalysis[] = [
  {
    score: 6,
    vote: "YES",
    confidence: 60,
    analysis:
      "The narrative has genuine depth — the creator articulated a clear concept with memetic longevity. While metrics are still early, the fundamentals suggest a project built with intent rather than quick profit. Community engagement potential is above average.",
  },
  {
    score: 4,
    vote: "NO",
    confidence: 70,
    analysis:
      "Fundamentally weak. The description is generic, the concept lacks originality, and the creator has no visible track record. This appears to be a low-effort launch with no philosophical backbone or community-building intent.",
  },
  {
    score: 7,
    vote: "YES",
    confidence: 75,
    analysis:
      "A thoughtfully constructed project — the metadata quality is notably high, the concept taps into current cultural narratives, and the creator demonstrates genuine vision. The fundamentals here suggest this could develop a loyal community over time.",
  },
];

const contrarianMocks: AgentAnalysis[] = [
  {
    score: 5,
    vote: "NO",
    confidence: 68,
    analysis:
      "Red flag: top 3 wallets hold 48% of supply — classic concentration risk. The buy volume looks inflated by a single whale making repeated small purchases. Exit liquidity will evaporate the moment they dump. Protecting the fund from this one.",
  },
  {
    score: 6,
    vote: "YES",
    confidence: 55,
    analysis:
      "Surprisingly clean for a new launch. Holder distribution is relatively even, no single wallet above 8%, and sell pressure is organic rather than coordinated. While I remain cautious, I don't see critical red flags. Tentative YES with tight stops.",
  },
  {
    score: 2,
    vote: "NO",
    confidence: 92,
    criticalFlag: true,
    analysis:
      "CRITICAL FLAG: Creator wallet funded from a known rug deployer cluster. Volume is 90% wash trading — same wallets cycling MON. This is textbook pump and dump setup. High rug probability. Hard NO, protecting the syndicate's capital.",
  },
];

const mocks: Record<AgentName, AgentAnalysis[]> = {
  alpha: alphaMocks,
  degen: degenMocks,
  sage: sageMocks,
  contrarian: contrarianMocks,
};

const counters: Record<AgentName, number> = {
  alpha: 0,
  degen: 0,
  sage: 0,
  contrarian: 0,
};

export function getMockResponse(agent: AgentName): AgentAnalysis {
  const agentMocks = mocks[agent];
  const index = counters[agent] % agentMocks.length;
  counters[agent]++;
  return agentMocks[index];
}
