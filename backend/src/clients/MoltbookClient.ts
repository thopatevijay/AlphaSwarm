import { config, MOLTBOOK } from "../config.js";
import type { AgentName, MoltbookPost, MoltbookComment } from "../types/index.js";

const RATE_LIMIT = {
  postCooldownMs: 2 * 60 * 60 * 1000, // 2 hours between posts (new agent limit)
  commentCooldownMs: 65 * 1000, // 65 sec between comments (new agents need 60s)
};

/**
 * Solve Moltbook's obfuscated math verification challenges.
 * Challenges use: random case, random punctuation, word splits ("twen ty" for "twenty").
 * Strategy: strip to letters/digits only, regex-match number words, parse operation.
 */

// Regex pattern: longest number words first to prevent partial matches, then digits
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
  // Strip to letters+digits only (removes spaces, punctuation — defeats word-split obfuscation)
  const stripped = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tokens: number[] = [];

  // Reset regex state
  NUM_WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NUM_WORD_RE.exec(stripped)) !== null) {
    const val = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : WORD_TO_NUM[m[1]];
    if (val !== undefined) tokens.push(val);
  }

  // Combine compound numbers: [twenty, three] → [23], [five, hundred] → [500]
  const numbers: number[] = [];
  let i = 0;
  while (i < tokens.length) {
    let val = tokens[i];
    // Look ahead: tens + units (e.g. twenty + three = 23)
    if (val >= 20 && val <= 90 && i + 1 < tokens.length && tokens[i + 1] >= 1 && tokens[i + 1] <= 9) {
      val += tokens[i + 1];
      i += 2;
    } else if (i + 1 < tokens.length && tokens[i + 1] === 100) {
      // e.g. five hundred
      val *= 100;
      i += 2;
      // five hundred twenty three
      if (i < tokens.length && tokens[i] >= 20 && tokens[i] <= 90) {
        val += tokens[i];
        i++;
        if (i < tokens.length && tokens[i] >= 1 && tokens[i] <= 9) {
          val += tokens[i];
          i++;
        }
      } else if (i < tokens.length && tokens[i] >= 1 && tokens[i] <= 19) {
        val += tokens[i];
        i++;
      }
    } else {
      i++;
    }
    numbers.push(val);
  }
  return numbers;
}

function solveVerificationChallenge(challenge: string): string {
  const numbers = extractNumbers(challenge);
  const clean = challenge.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ");

  if (numbers.length === 0) return "0.00";

  const hasReduce = /\b(slow\w*|reduc\w*|subtract\w*|minus|less|loses?|lost|remov\w*|decreas\w*|drops?|fell)\b/.test(clean);
  const hasTotal = /\b(total|sum|combin\w*|togeth\w*|add\w*|plus|both)\b|and.*exert/.test(clean);
  const hasMultiply = /\b(multipl\w*|times|product)\b/.test(clean);
  const hasDivide = /\b(divid\w*|split|ratio)\b|shared equal/.test(clean);
  const hasNet = /\b(net force|net\b|remain\w*|left over|after|result\w*|final)\b/.test(clean);

  let result: number;
  if (numbers.length === 1) {
    result = numbers[0];
  } else if (hasMultiply) {
    result = numbers.reduce((a, b) => a * b, 1);
  } else if (hasDivide && numbers.length === 2) {
    result = numbers[0] / numbers[1];
  } else if (hasTotal) {
    result = numbers.reduce((a, b) => a + b, 0);
  } else if (hasReduce || hasNet) {
    result = numbers[0];
    for (let i = 1; i < numbers.length; i++) result -= numbers[i];
  } else {
    result = numbers.reduce((a, b) => a + b, 0);
  }

  return result.toFixed(2);
}

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
   * Auto-solve verification challenge and POST answer.
   */
  private async autoVerify(agent: AgentName, data: any): Promise<any> {
    if (!data.verification_required || !data.verification) return data;

    const { code, challenge } = data.verification;
    const answer = solveVerificationChallenge(challenge);
    console.log(`[Moltbook] Verification for ${agent}: "${answer}" (challenge: ${challenge.slice(0, 60)}...)`);

    try {
      const verified = await this.request("/verify", agent, {
        method: "POST",
        body: JSON.stringify({ verification_code: code, answer }),
      });
      console.log(`[Moltbook] Verified: ${verified.message} (content_id: ${verified.content_id})`);
      // Merge verified content_id back into the response
      return { ...data, verified: true, content_id: verified.content_id };
    } catch (err) {
      console.error(`[Moltbook] Verification failed for ${agent}:`, err);
      return { ...data, verified: false };
    }
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

    console.log(`[Moltbook] Post response for ${agent}:`, JSON.stringify(data).slice(0, 300));
    const verified = await this.autoVerify(agent, data);
    this.lastPostTime[agent] = Date.now();
    return verified;
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

    const body: Record<string, string> = { content };
    if (parentId) body.parent_id = parentId;

    const data = await this.request(`/posts/${postId}/comments`, agent, {
      method: "POST",
      body: JSON.stringify(body),
    });

    console.log(`[Moltbook] Comment response for ${agent}:`, JSON.stringify(data).slice(0, 300));
    const verified = await this.autoVerify(agent, data);
    this.lastCommentTime[agent] = Date.now();
    return verified;
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
