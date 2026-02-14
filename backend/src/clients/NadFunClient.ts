import { config, getNetwork } from "../config.js";
import type { TokenInfo, TokenMarket, TokenMetrics, ChartCandle } from "../types/index.js";

export class NadFunClient {
  private get baseUrl(): string {
    return getNetwork().apiUrl;
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (config.nadFunApiKey) {
      h["X-API-Key"] = config.nadFunApiKey;
    }
    return h;
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`nad.fun API error ${res.status} for ${path}: ${text}`);
    }
    return res.json();
  }

  /**
   * Get token info (name, symbol, creator, graduated status).
   */
  async getToken(tokenId: string): Promise<TokenInfo> {
    return this.request<TokenInfo>(`/agent/token/${tokenId}`);
  }

  /**
   * Get current market data (price, holders, volume).
   */
  async getMarket(tokenId: string): Promise<TokenMarket> {
    return this.request<TokenMarket>(`/agent/market/${tokenId}`);
  }

  /**
   * Get trading metrics by timeframe.
   */
  async getMetrics(tokenId: string, timeframe = "1h"): Promise<TokenMetrics> {
    return this.request<TokenMetrics>(
      `/agent/metrics/${tokenId}?timeframe=${timeframe}`
    );
  }

  /**
   * Get OHLCV chart data.
   */
  async getChart(tokenId: string): Promise<ChartCandle[]> {
    return this.request<ChartCandle[]>(`/agent/chart/${tokenId}`);
  }

  /**
   * Get swap/transaction history for a token.
   */
  async getSwapHistory(tokenId: string): Promise<any[]> {
    return this.request<any[]>(`/agent/swap-history/${tokenId}`);
  }

  /**
   * Get holdings for an account.
   */
  async getHoldings(accountId: string): Promise<any[]> {
    return this.request<any[]>(`/agent/holdings/${accountId}`);
  }

  /**
   * Get tokens created by an account.
   */
  async getCreatedTokens(accountId: string): Promise<any[]> {
    return this.request<any[]>(`/agent/token/created/${accountId}`);
  }

  /**
   * Gather all data for a token in one call.
   */
  async getFullTokenData(tokenId: string): Promise<{
    token: TokenInfo;
    market: TokenMarket;
    metrics: TokenMetrics;
    chart: ChartCandle[];
  }> {
    const [token, market, metrics, chart] = await Promise.all([
      this.getToken(tokenId),
      this.getMarket(tokenId),
      this.getMetrics(tokenId),
      this.getChart(tokenId),
    ]);
    return { token, market, metrics, chart };
  }
}
