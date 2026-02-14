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
