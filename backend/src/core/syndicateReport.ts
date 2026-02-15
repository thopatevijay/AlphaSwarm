import { getDb } from "../db/database.js";
import { MoltbookClient } from "../clients/MoltbookClient.js";
import { Portfolio } from "./portfolio.js";

/**
 * Posts periodic "SYNDICATE REPORT" summaries to m/alphaswarm on Moltbook.
 * Aggregates fund performance data and posts as the ALPHA agent.
 */
export class SyndicateReport {
  private moltbook: MoltbookClient;
  private portfolio: Portfolio;

  constructor(moltbook: MoltbookClient, portfolio: Portfolio) {
    this.moltbook = moltbook;
    this.portfolio = portfolio;
  }

  async postReport(): Promise<void> {
    try {
      const stats = this.gatherStats();
      const content = this.formatReport(stats);

      console.log("[SyndicateReport] Posting fund summary...");
      const post = await this.moltbook.createPost(
        "alpha",
        `SYNDICATE REPORT — ${new Date().toISOString().slice(0, 10)}`,
        content
      );

      if (post) {
        console.log("[SyndicateReport] Report posted successfully");
      } else {
        console.log("[SyndicateReport] Post rate-limited, will retry later");
      }
    } catch (err) {
      console.warn("[SyndicateReport] Failed to post report:", err);
    }
  }

  private gatherStats(): ReportStats {
    const db = getDb();

    // Token analysis stats
    const tokenCount = (db.prepare("SELECT COUNT(*) as c FROM analyzed_tokens").get() as any)?.c || 0;
    const analyzedCount = (db.prepare("SELECT COUNT(*) as c FROM analyzed_tokens WHERE votes_json IS NOT NULL").get() as any)?.c || 0;
    const investCount = (db.prepare("SELECT COUNT(*) as c FROM analyzed_tokens WHERE decision = 'INVEST'").get() as any)?.c || 0;
    const passCount = (db.prepare("SELECT COUNT(*) as c FROM analyzed_tokens WHERE decision = 'PASS'").get() as any)?.c || 0;

    // Portfolio stats
    const holdings = this.portfolio.getActiveHoldings();
    const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.buyAmountMON || "0"), 0);

    // Trade stats
    const tradeCount = (db.prepare("SELECT COUNT(*) as c FROM events WHERE type = 'trade_executed'").get() as any)?.c || 0;

    // Top/bottom scores
    const topToken = db.prepare(
      "SELECT token_name, weighted_score FROM analyzed_tokens WHERE weighted_score IS NOT NULL ORDER BY weighted_score DESC LIMIT 1"
    ).get() as any;
    const bottomToken = db.prepare(
      "SELECT token_name, weighted_score FROM analyzed_tokens WHERE weighted_score IS NOT NULL ORDER BY weighted_score ASC LIMIT 1"
    ).get() as any;

    return {
      tokenCount,
      analyzedCount,
      investCount,
      passCount,
      holdingCount: holdings.length,
      totalInvested,
      tradeCount,
      topToken: topToken ? `${topToken.token_name} (${Number(topToken.weighted_score).toFixed(1)})` : "N/A",
      bottomToken: bottomToken ? `${bottomToken.token_name} (${Number(bottomToken.weighted_score).toFixed(1)})` : "N/A",
    };
  }

  private formatReport(stats: ReportStats): string {
    return `SYNDICATE REPORT

AlphaSwarm Fund Performance Summary

Tokens Discovered: ${stats.tokenCount}
Tokens Analyzed: ${stats.analyzedCount}
Invest Decisions: ${stats.investCount}
Pass Decisions: ${stats.passCount}
Approval Rate: ${stats.analyzedCount > 0 ? ((stats.investCount / stats.analyzedCount) * 100).toFixed(0) : 0}%

Active Holdings: ${stats.holdingCount}
Total Invested: ${stats.totalInvested.toFixed(2)} MON
Total Trades: ${stats.tradeCount}

Highest Score: ${stats.topToken}
Lowest Score: ${stats.bottomToken}

The swarm continues to monitor nad.fun for new opportunities. All analyses are posted publicly to m/alphaswarm for full transparency.

Dashboard: https://alpha-swarm-moltiverse.vercel.app
GitHub: https://github.com/thopatevijay/AlphaSwarm`;
  }
}

interface ReportStats {
  tokenCount: number;
  analyzedCount: number;
  investCount: number;
  passCount: number;
  holdingCount: number;
  totalInvested: number;
  tradeCount: number;
  topToken: string;
  bottomToken: string;
}
