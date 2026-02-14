import { LLMClient } from "../clients/LLMClient.js";
import { AgentAnalysisSchema, type AgentAnalysis, type AgentName } from "../types/index.js";
import { getAgentPrompt } from "./prompts.js";
import { config } from "../config.js";

// Import mock responses
import { getMockResponse } from "./mocks/index.js";

export class BaseAgent {
  readonly name: AgentName;
  private llm: LLMClient;
  private prompt: string;

  constructor(name: AgentName, llm: LLMClient) {
    this.name = name;
    this.llm = llm;
    this.prompt = getAgentPrompt(name);
  }

  /**
   * Analyze a token and produce a structured vote.
   */
  async analyze(tokenData: string): Promise<AgentAnalysis> {
    // Mock mode — return pre-written response
    if (config.mockLLM) {
      return getMockResponse(this.name);
    }

    const response = await this.llm.generate(this.prompt, tokenData);

    // Parse the JSON response
    try {
      // Strip markdown code fences if present
      let content = response.content.trim();
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const parsed = JSON.parse(content);
      const validated = AgentAnalysisSchema.parse(parsed);
      return validated;
    } catch (err) {
      console.error(`[${this.name}] Failed to parse LLM response:`, response.content);
      // Return a conservative fallback
      return {
        score: 3,
        vote: "NO",
        confidence: 20,
        analysis: `[${this.name}] Analysis failed — defaulting to conservative NO vote.`,
      };
    }
  }

  /**
   * Format token data into a prompt for the LLM.
   */
  static formatTokenData(data: {
    token: { name: string; symbol: string; description?: string; creator: string };
    market: { price?: string; volume24h?: string; holders?: number; buyCount?: number; sellCount?: number };
    metrics: { priceChange?: number; buyVolume?: string; sellVolume?: string };
    progress?: number;
  }): string {
    return `TOKEN ANALYSIS REQUEST

Name: ${data.token.name}
Symbol: ${data.token.symbol}
Description: ${data.token.description || "N/A"}
Creator: ${data.token.creator}

MARKET DATA:
- Price: ${data.market.price || "N/A"}
- 24h Volume: ${data.market.volume24h || "N/A"}
- Holders: ${data.market.holders ?? "N/A"}
- Buy Count: ${data.market.buyCount ?? "N/A"}
- Sell Count: ${data.market.sellCount ?? "N/A"}

METRICS:
- Price Change: ${data.metrics.priceChange != null ? data.metrics.priceChange + "%" : "N/A"}
- Buy Volume: ${data.metrics.buyVolume || "N/A"}
- Sell Volume: ${data.metrics.sellVolume || "N/A"}

CURVE:
- Graduation Progress: ${data.progress != null ? (data.progress / 100).toFixed(1) + "%" : "N/A"}

Analyze this token and provide your assessment.`;
  }
}
