import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import crypto from "crypto";
import { config } from "../config.js";
import { getDb } from "../db/database.js";

interface LLMResponse {
  content: string;
  model: string;
  cached: boolean;
}

export class LLMClient {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;

  constructor() {
    if (config.anthropicApiKey) {
      this.anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
    }
    if (config.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    }
  }

  /**
   * Generate a response from the LLM.
   * Priority: cache → mock → Claude → OpenAI
   */
  async generate(
    systemPrompt: string,
    userMessage: string,
    options?: { model?: string; maxTokens?: number }
  ): Promise<LLMResponse> {
    const maxTokens = options?.maxTokens || 1024;

    // Check cache first
    const cacheKey = this.getCacheKey(systemPrompt, userMessage);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return { content: cached, model: "cache", cached: true };
    }

    // Mock mode
    if (config.mockLLM) {
      return { content: "", model: "mock", cached: false };
    }

    // Try Claude first
    if (this.anthropic) {
      try {
        const model = options?.model || "claude-haiku-4-5-20251001";
        const response = await this.anthropic.messages.create({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });
        const content =
          response.content[0].type === "text" ? response.content[0].text : "";
        this.saveToCache(cacheKey, content);
        return { content, model, cached: false };
      } catch (err) {
        console.error("Claude API error, falling back to OpenAI:", err);
      }
    }

    // Fallback to OpenAI
    if (this.openai) {
      try {
        const model = "gpt-4o-mini";
        const response = await this.openai.chat.completions.create({
          model,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });
        const content = response.choices[0]?.message?.content || "";
        this.saveToCache(cacheKey, content);
        return { content, model, cached: false };
      } catch (err) {
        console.error("OpenAI API error:", err);
      }
    }

    throw new Error("No LLM available. Set ANTHROPIC_API_KEY or OPENAI_API_KEY, or enable MOCK_LLM.");
  }

  private getCacheKey(systemPrompt: string, userMessage: string): string {
    return crypto
      .createHash("sha256")
      .update(systemPrompt + userMessage)
      .digest("hex");
  }

  private getFromCache(key: string): string | null {
    try {
      const db = getDb();
      const row = db
        .prepare("SELECT response FROM llm_cache WHERE cache_key = ?")
        .get(key) as { response: string } | undefined;
      return row?.response || null;
    } catch {
      return null;
    }
  }

  private saveToCache(key: string, response: string): void {
    try {
      const db = getDb();
      db.prepare(
        "INSERT OR REPLACE INTO llm_cache (cache_key, response, created_at) VALUES (?, ?, ?)"
      ).run(key, response, Date.now());
    } catch {
      // Cache write failure is non-critical
    }
  }
}
