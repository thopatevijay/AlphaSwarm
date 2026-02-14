import { LLMClient } from "../clients/LLMClient.js";
import { MoltbookClient } from "../clients/MoltbookClient.js";
import { NadFunClient } from "../clients/NadFunClient.js";
import { MonadTrader } from "../clients/MonadTrader.js";
import { BaseAgent } from "../agents/BaseAgent.js";
import { TokenScanner } from "./tokenScanner.js";
import { VoteEngine } from "./voteEngine.js";
import { Portfolio } from "./portfolio.js";
import { getDb } from "../db/database.js";
import { config, TRADING, AGENT_NAMES } from "../config.js";
import type { AgentName, AgentAnalysis, SwarmEvent, VoteResult } from "../types/index.js";

export class Orchestrator {
  private llm: LLMClient;
  private moltbook: MoltbookClient;
  private nadFun: NadFunClient;
  private trader: MonadTrader;
  private scanner: TokenScanner;
  private voteEngine: VoteEngine;
  private portfolio: Portfolio;
  private agents: Map<AgentName, BaseAgent>;
  private running = false;

  constructor() {
    this.llm = new LLMClient();
    this.moltbook = new MoltbookClient();
    this.nadFun = new NadFunClient();
    this.trader = new MonadTrader();
    this.scanner = new TokenScanner(this.nadFun);
    this.voteEngine = new VoteEngine();
    this.portfolio = new Portfolio();

    // Create agent instances
    this.agents = new Map();
    for (const name of AGENT_NAMES) {
      this.agents.set(name, new BaseAgent(name, this.llm));
    }
  }

  /**
   * Run the full pipeline for a list of token addresses.
   */
  async analyzeTokens(tokenIds: string[]): Promise<VoteResult[]> {
    const results: VoteResult[] = [];

    // Discover new tokens
    const newTokens = await this.scanner.discoverNewTokens(tokenIds);
    if (newTokens.length === 0) {
      console.log("[Orchestrator] No new tokens to analyze");
      return results;
    }

    for (const token of newTokens) {
      this.logEvent({
        type: "token_discovered",
        tokenId: token.id,
        tokenName: token.name,
        message: `Discovered new token: ${token.name} ($${token.symbol})`,
        timestamp: Date.now(),
      });

      try {
        const result = await this.analyzeAndVote(token.id);
        if (result) results.push(result);
      } catch (err) {
        console.error(`[Orchestrator] Error analyzing ${token.name}:`, err);
        this.logEvent({
          type: "system",
          tokenId: token.id,
          tokenName: token.name,
          message: `Analysis failed for ${token.name}: ${err}`,
          timestamp: Date.now(),
        });
      }
    }

    return results;
  }

  /**
   * Full analysis pipeline for a single token.
   */
  private async analyzeAndVote(tokenId: string): Promise<VoteResult | null> {
    // 1. Gather data
    console.log(`[Orchestrator] Gathering data for ${tokenId}...`);
    let tokenData;
    try {
      tokenData = await this.nadFun.getFullTokenData(tokenId);
    } catch (err) {
      console.error(`[Orchestrator] Failed to fetch token data:`, err);
      return null;
    }

    // Check if token can be bought
    let progress = 0;
    try {
      const canBuy = await this.trader.canBuy(tokenId as `0x${string}`);
      if (!canBuy) {
        console.log(`[Orchestrator] Token ${tokenId} is graduated or locked, skipping`);
        return null;
      }
      progress = await this.trader.getProgress(tokenId as `0x${string}`);
    } catch (err) {
      console.warn(`[Orchestrator] Could not check buy status:`, err);
    }

    // 2. Agent analysis
    this.logEvent({
      type: "analysis_started",
      tokenId,
      tokenName: tokenData.token.name,
      message: `Starting analysis of ${tokenData.token.name} ($${tokenData.token.symbol})`,
      timestamp: Date.now(),
    });

    const prompt = BaseAgent.formatTokenData({
      token: tokenData.token,
      market: tokenData.market,
      metrics: tokenData.metrics,
      progress,
    });

    const votes: Record<AgentName, AgentAnalysis> = {} as any;
    for (const [name, agent] of this.agents) {
      console.log(`[${name}] Analyzing ${tokenData.token.name}...`);
      votes[name] = await agent.analyze(prompt);
      console.log(`[${name}] Score: ${votes[name].score}, Vote: ${votes[name].vote}`);
    }

    this.logEvent({
      type: "analysis_complete",
      tokenId,
      tokenName: tokenData.token.name,
      message: `All 4 agents analyzed ${tokenData.token.name}`,
      data: JSON.stringify(votes),
      timestamp: Date.now(),
    });

    // 3. Moltbook debate (non-critical — don't crash pipeline if posting fails)
    try {
      await this.postDebate(tokenId, tokenData.token.name, tokenData.token.symbol, votes);
    } catch (err) {
      console.warn(`[Orchestrator] Moltbook debate failed (non-critical):`, err);
      this.logEvent({
        type: "system",
        tokenId,
        tokenName: tokenData.token.name,
        message: `Moltbook debate failed: ${err}`,
        timestamp: Date.now(),
      });
    }

    // 4. Vote aggregation
    const result = this.voteEngine.evaluate(
      tokenId,
      tokenData.token.name,
      tokenData.token.symbol,
      votes
    );

    this.logEvent({
      type: "vote_complete",
      tokenId,
      tokenName: result.tokenName,
      message: `Vote: ${result.decision} (score: ${result.weightedScore}, ${result.yesCount}/4 YES)`,
      data: JSON.stringify(result),
      timestamp: Date.now(),
    });

    // Save to DB
    this.saveAnalysis(result);

    // 5. Trade execution
    if (result.decision === "INVEST") {
      await this.executeTrade(result);
    }

    return result;
  }

  // Fallback post ID for commenting when new post creation is rate-limited
  private static INTRO_POST_ID = "662624d7-273b-48e2-8f0c-1da7a0b6b427";

  /**
   * Post the debate to Moltbook.
   * Try creating a new post; if rate-limited, fall back to commenting on intro post.
   */
  private async postDebate(
    tokenId: string,
    tokenName: string,
    tokenSymbol: string,
    votes: Record<AgentName, AgentAnalysis>
  ): Promise<void> {
    const title = `Token Analysis: ${tokenName} ($${tokenSymbol})`;
    const alphaContent = `ALPHA's Quantitative Analysis:\n\nScore: ${votes.alpha.score}/10 | Vote: ${votes.alpha.vote} | Confidence: ${votes.alpha.confidence}%\n\n${votes.alpha.analysis}`;

    // Try to create a new post
    let postId: string | null = null;
    try {
      const post = await this.moltbook.createPost("alpha", title, alphaContent);
      if (post) {
        // Moltbook returns: { post: { id: "..." }, content_id: "..." (after verify) }
        postId = post.content_id || post.post?.id || post.id || null;
        console.log(`[Orchestrator] Post created, postId: ${postId}`);
      }
    } catch (err) {
      console.warn(`[Orchestrator] Could not create new post (rate limit?):`, err);
    }

    // Fall back to intro post for comments
    if (!postId) {
      postId = Orchestrator.INTRO_POST_ID;
      console.log(`[Orchestrator] Using intro post ${postId} for debate comments`);
    } else {
      this.logEvent({
        type: "debate_posted",
        agent: "alpha",
        tokenId,
        tokenName,
        message: `ALPHA posted analysis for ${tokenName}`,
        timestamp: Date.now(),
      });
    }

    // All agents comment (including ALPHA if we fell back to intro post)
    const agents: { name: AgentName; analysis: AgentAnalysis }[] = postId === Orchestrator.INTRO_POST_ID
      ? AGENT_NAMES.map((name) => ({ name, analysis: votes[name] }))
      : (["degen", "sage", "contrarian"] as AgentName[]).map((name) => ({ name, analysis: votes[name] }));

    for (const { name, analysis } of agents) {
      const content = `${name.toUpperCase()} on ${tokenName} ($${tokenSymbol}):\n\nScore: ${analysis.score}/10 | Vote: ${analysis.vote} | Confidence: ${analysis.confidence}%\n\n${analysis.analysis}`;

      try {
        await this.moltbook.createComment(name, postId, content);
        this.logEvent({
          type: "debate_posted",
          agent: name,
          tokenId,
          tokenName,
          message: `${name.toUpperCase()} commented on ${tokenName}`,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn(`[Orchestrator] ${name} comment failed:`, err);
      }

      // Moltbook requires 60s between comments for new agents (<24h old)
      await new Promise((r) => setTimeout(r, 65000));
    }
  }

  /**
   * Execute a buy trade when the vote passes.
   */
  private async executeTrade(result: VoteResult): Promise<void> {
    try {
      console.log(`[Orchestrator] Executing buy for ${result.tokenName}...`);
      const { hash, amountOut } = await this.trader.buy(
        result.tokenId as `0x${string}`,
        TRADING.maxBuyAmountMON
      );

      this.portfolio.addHolding({
        tokenId: result.tokenId,
        tokenName: result.tokenName,
        tokenSymbol: result.tokenSymbol,
        amount: amountOut,
        buyPrice: "0", // Will be calculated from amountOut/MON spent
        buyAmountMON: TRADING.maxBuyAmountMON,
        buyTxHash: hash,
        status: "holding",
        boughtAt: Date.now(),
      });

      this.logEvent({
        type: "trade_executed",
        tokenId: result.tokenId,
        tokenName: result.tokenName,
        message: `Bought ${result.tokenName} for ${TRADING.maxBuyAmountMON} MON (tx: ${hash})`,
        data: JSON.stringify({ hash, amountOut }),
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[Orchestrator] Trade failed:`, err);
      this.logEvent({
        type: "trade_failed",
        tokenId: result.tokenId,
        tokenName: result.tokenName,
        message: `Trade failed for ${result.tokenName}: ${err}`,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Check portfolio for exit conditions.
   */
  async checkExits(): Promise<void> {
    const holdings = this.portfolio.getActiveHoldings();
    for (const holding of holdings) {
      try {
        const market = await this.nadFun.getMarket(holding.tokenId);
        const currentPrice = parseFloat(market.price || "0");
        const buyPrice = parseFloat(holding.buyPrice) || currentPrice;

        if (buyPrice === 0) continue;

        const pnlPct = ((currentPrice - buyPrice) / buyPrice) * 100;

        // Update holding
        this.portfolio.updateHolding(holding.tokenId, {
          currentPrice: market.price,
          pnlPercent: pnlPct,
        });

        // Check exit conditions
        if (pnlPct >= TRADING.takeProfitPct) {
          console.log(`[Orchestrator] Take profit triggered for ${holding.tokenName} (+${pnlPct.toFixed(1)}%)`);
          await this.executeSell(holding.tokenId, holding.tokenName, "take_profit");
        } else if (pnlPct <= -TRADING.stopLossPct) {
          console.log(`[Orchestrator] Stop loss triggered for ${holding.tokenName} (${pnlPct.toFixed(1)}%)`);
          await this.executeSell(holding.tokenId, holding.tokenName, "stop_loss");
        }
      } catch (err) {
        console.warn(`[Orchestrator] Error checking exit for ${holding.tokenId}:`, err);
      }
    }
  }

  private async executeSell(tokenId: string, tokenName: string, reason: string): Promise<void> {
    try {
      const { hash } = await this.trader.sell(tokenId as `0x${string}`);
      this.portfolio.updateHolding(tokenId, {
        sellTxHash: hash,
        status: "sold",
        soldAt: Date.now(),
      });
      this.logEvent({
        type: "exit_triggered",
        tokenId,
        tokenName,
        message: `Sold ${tokenName} (${reason}) — tx: ${hash}`,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(`[Orchestrator] Sell failed for ${tokenName}:`, err);
    }
  }

  private saveAnalysis(result: VoteResult): void {
    try {
      const db = getDb();
      db.prepare(
        `UPDATE analyzed_tokens SET weighted_score = ?, decision = ?, votes_json = ?, analyzed_at = ?
         WHERE token_id = ?`
      ).run(result.weightedScore, result.decision, JSON.stringify(result.votes), Date.now(), result.tokenId);
    } catch {
      // Non-critical
    }
  }

  private logEvent(event: SwarmEvent): void {
    console.log(`[Event] ${event.type}: ${event.message}`);
    try {
      const db = getDb();
      db.prepare(
        `INSERT INTO events (type, agent, token_id, token_name, message, data, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(event.type, event.agent || null, event.tokenId || null, event.tokenName || null, event.message, event.data || null, event.timestamp);
    } catch {
      // Non-critical
    }
  }

  // --- Dashboard API helpers ---

  getRecentEvents(limit = 50): SwarmEvent[] {
    try {
      const db = getDb();
      return db
        .prepare("SELECT * FROM events ORDER BY timestamp DESC LIMIT ?")
        .all(limit) as SwarmEvent[];
    } catch {
      return [];
    }
  }

  getPortfolioData() {
    return this.portfolio.getSummary();
  }

  getAgentStatus() {
    return AGENT_NAMES.map((name) => ({
      name,
      status: "idle" as const,
      totalAnalyses: 0,
      avgScore: 0,
    }));
  }

  getAnalyzedTokens() {
    try {
      const db = getDb();
      return db
        .prepare("SELECT * FROM analyzed_tokens ORDER BY discovered_at DESC LIMIT 50")
        .all();
    } catch {
      return [];
    }
  }

  getWalletAddress(): string {
    return this.trader.address;
  }

  async getBalance(): Promise<string> {
    return this.trader.getBalance();
  }
}
