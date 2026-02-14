import { config, MOLTBOOK } from "../config.js";
import type { AgentName, MoltbookPost, MoltbookComment } from "../types/index.js";

const RATE_LIMIT = {
  postCooldownMs: 30 * 60 * 1000, // 30 min between posts
  commentCooldownMs: 20 * 1000, // 20 sec between comments
};

export class MoltbookClient {
  private lastPostTime: Record<string, number> = {};
  private lastCommentTime: Record<string, number> = {};

  private getApiKey(agent: AgentName): string {
    return config.moltbookKeys[agent];
  }

  private async request(
    path: string,
    agent: AgentName,
    options?: RequestInit
  ): Promise<any> {
    const apiKey = this.getApiKey(agent);
    if (!apiKey) {
      throw new Error(`No Moltbook API key for agent: ${agent}`);
    }

    const url = `${MOLTBOOK.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...options?.headers,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Moltbook API error ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
  }

  /**
   * Create a post in the AlphaSwarm submolt.
   */
  async createPost(
    agent: AgentName,
    title: string,
    content: string
  ): Promise<MoltbookPost | null> {
    if (config.dryRun) {
      console.log(`[DRY RUN] ${agent} would post: "${title}"`);
      return null;
    }

    // Rate limit check
    const now = Date.now();
    const lastPost = this.lastPostTime[agent] || 0;
    if (now - lastPost < RATE_LIMIT.postCooldownMs) {
      const waitSec = Math.ceil((RATE_LIMIT.postCooldownMs - (now - lastPost)) / 1000);
      console.log(`[RATE LIMIT] ${agent} must wait ${waitSec}s before next post`);
      return null;
    }

    const data = await this.request("/posts", agent, {
      method: "POST",
      body: JSON.stringify({
        submolt: MOLTBOOK.submolt,
        title,
        content,
      }),
    });

    this.lastPostTime[agent] = Date.now();
    return data;
  }

  /**
   * Comment on a post (optionally as a reply to another comment).
   */
  async createComment(
    agent: AgentName,
    postId: string,
    content: string,
    parentId?: string
  ): Promise<MoltbookComment | null> {
    if (config.dryRun) {
      console.log(`[DRY RUN] ${agent} would comment on ${postId}: "${content.slice(0, 80)}..."`);
      return null;
    }

    // Rate limit check
    const now = Date.now();
    const lastComment = this.lastCommentTime[agent] || 0;
    if (now - lastComment < RATE_LIMIT.commentCooldownMs) {
      const waitMs = RATE_LIMIT.commentCooldownMs - (now - lastComment);
      await new Promise((r) => setTimeout(r, waitMs));
    }

    const body: Record<string, string> = { post_id: postId, content };
    if (parentId) body.parent_id = parentId;

    const data = await this.request("/comments", agent, {
      method: "POST",
      body: JSON.stringify(body),
    });

    this.lastCommentTime[agent] = Date.now();
    return data;
  }

  /**
   * Search Moltbook for content related to a query.
   */
  async search(agent: AgentName, query: string): Promise<any> {
    return this.request(
      `/search?q=${encodeURIComponent(query)}&type=all`,
      agent
    );
  }
}
