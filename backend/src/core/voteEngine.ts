import type { AgentAnalysis, AgentName, VoteResult } from "../types/index.js";
import { TRADING } from "../config.js";

const VOTE_WEIGHTS: Record<AgentName, number> = {
  alpha: 1.0,
  degen: 0.8,
  sage: 1.0,
  contrarian: 1.2,
};

export class VoteEngine {
  /**
   * Aggregate agent votes into a final investment decision.
   *
   * Decision criteria:
   * - Weighted score >= threshold (default 6.0)
   * - At least 3 YES votes
   * - No critical flag from CONTRARIAN
   */
  evaluate(
    tokenId: string,
    tokenName: string,
    tokenSymbol: string,
    votes: Record<AgentName, AgentAnalysis>
  ): VoteResult {
    // Calculate weighted score
    let totalWeight = 0;
    let weightedSum = 0;
    let yesCount = 0;
    let criticalFlag = false;

    for (const [agent, analysis] of Object.entries(votes) as [AgentName, AgentAnalysis][]) {
      const weight = VOTE_WEIGHTS[agent];
      weightedSum += analysis.score * weight;
      totalWeight += weight;

      if (analysis.vote === "YES") yesCount++;
      if (analysis.criticalFlag) criticalFlag = true;
    }

    const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Decision logic
    const meetsScore = weightedScore >= TRADING.voteThreshold;
    const meetsVotes = yesCount >= TRADING.minYesVotes;
    const noCritical = !criticalFlag;

    const decision: "INVEST" | "PASS" =
      meetsScore && meetsVotes && noCritical ? "INVEST" : "PASS";

    return {
      tokenId,
      tokenName,
      tokenSymbol,
      votes,
      weightedScore: Math.round(weightedScore * 100) / 100,
      yesCount,
      decision,
      criticalFlag,
      timestamp: Date.now(),
    };
  }

  /**
   * Format vote result for display / Moltbook posting.
   */
  static formatResult(result: VoteResult): string {
    const lines = [
      `SYNDICATE VOTE: ${result.tokenName} ($${result.tokenSymbol})`,
      ``,
      `Weighted Score: ${result.weightedScore.toFixed(1)}/10`,
      `Votes: ${result.yesCount}/4 YES`,
      `Critical Flag: ${result.criticalFlag ? "YES" : "No"}`,
      `Decision: ${result.decision}`,
      ``,
    ];

    for (const [agent, analysis] of Object.entries(result.votes)) {
      const emoji = analysis.vote === "YES" ? "+" : "-";
      lines.push(
        `[${emoji}] ${agent.toUpperCase()} (${analysis.score}/10, ${analysis.confidence}% conf): ${analysis.analysis}`
      );
    }

    return lines.join("\n");
  }
}
