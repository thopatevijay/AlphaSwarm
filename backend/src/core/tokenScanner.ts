import { NadFunClient } from "../clients/NadFunClient.js";
import { getDb } from "../db/database.js";
import type { TokenInfo } from "../types/index.js";

export class TokenScanner {
  private nadFun: NadFunClient;
  private seenTokens: Set<string> = new Set();

  constructor(nadFun: NadFunClient) {
    this.nadFun = nadFun;
    this.loadSeenTokens();
  }

  private loadSeenTokens(): void {
    try {
      const db = getDb();
      const rows = db
        .prepare("SELECT token_id FROM analyzed_tokens")
        .all() as { token_id: string }[];
      for (const row of rows) {
        this.seenTokens.add(row.token_id);
      }
      console.log(`[Scanner] Loaded ${this.seenTokens.size} previously seen tokens`);
    } catch {
      // DB not ready yet, will populate on first run
    }
  }

  /**
   * Discover new tokens by checking recent swap activity.
   * Since nad.fun doesn't have a "list all tokens" endpoint,
   * we monitor recent activity and discover tokens that way.
   *
   * For the hackathon demo, we can also manually feed token addresses.
   */
  async discoverNewTokens(knownTokenIds?: string[]): Promise<TokenInfo[]> {
    const newTokens: TokenInfo[] = [];

    // If specific tokens provided (manual feed or from external source)
    if (knownTokenIds && knownTokenIds.length > 0) {
      for (const tokenId of knownTokenIds) {
        if (this.seenTokens.has(tokenId)) continue;
        try {
          const token = await this.nadFun.getToken(tokenId);
          if (!token.graduated) {
            // Only interested in tokens still on bonding curve
            newTokens.push(token);
            this.markSeen(tokenId, token);
          }
        } catch (err) {
          console.error(`[Scanner] Error fetching token ${tokenId}:`, err);
        }
      }
    }

    return newTokens;
  }

  /**
   * Mark a token as seen so we don't re-analyze it.
   */
  private markSeen(tokenId: string, token: TokenInfo): void {
    this.seenTokens.add(tokenId);
    try {
      const db = getDb();
      db.prepare(
        `INSERT OR IGNORE INTO analyzed_tokens (token_id, token_name, token_symbol, discovered_at)
         VALUES (?, ?, ?, ?)`
      ).run(tokenId, token.name, token.symbol, Date.now());
    } catch {
      // Non-critical
    }
  }

  /**
   * Discover new tokens by crawling the network:
   * 1. Pick a known token → get its swap history → find active wallets
   * 2. Query those wallets' holdings → find non-graduated tokens we haven't seen
   */
  async discoverFromNetwork(seedTokenId: string): Promise<string[]> {
    const discovered: string[] = [];

    try {
      // Step 1: Get swap history to find active wallets
      const swapData = await this.nadFun.getSwapHistory(seedTokenId) as any;
      const swaps = swapData?.swaps || swapData || [];
      const wallets = new Set<string>();
      for (const swap of swaps) {
        const wallet = swap?.account_info?.account_id;
        if (wallet) wallets.add(wallet);
        if (wallets.size >= 5) break; // Limit to 5 wallets to stay within rate limits
      }

      // Step 2: Query each wallet's holdings for non-graduated tokens
      for (const wallet of wallets) {
        try {
          const holdingsData = await this.nadFun.getHoldings(wallet) as any;
          const tokens = holdingsData?.tokens || holdingsData || [];
          for (const t of tokens) {
            const tokenInfo = t?.token_info;
            if (!tokenInfo) continue;
            const tokenId = tokenInfo.token_id;
            if (!tokenId || tokenInfo.is_graduated || this.seenTokens.has(tokenId)) continue;
            discovered.push(tokenId);
          }
        } catch {
          // Rate limited or error — skip this wallet
        }
      }
    } catch (err) {
      console.warn(`[Scanner] Network discovery failed:`, err);
    }

    if (discovered.length > 0) {
      console.log(`[Scanner] Discovered ${discovered.length} new tokens from network crawl`);
    }
    return discovered;
  }

  /**
   * Check if a token has already been analyzed.
   */
  hasSeen(tokenId: string): boolean {
    return this.seenTokens.has(tokenId);
  }

  /**
   * Get count of seen tokens.
   */
  get seenCount(): number {
    return this.seenTokens.size;
  }
}
