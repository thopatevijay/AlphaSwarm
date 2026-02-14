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
   * API returns { token_info: { token_id, name, symbol, ... } }
   */
  async getToken(tokenId: string): Promise<TokenInfo> {
    const raw = await this.request<any>(`/agent/token/${tokenId}`);
    const t = raw.token_info || raw;
    return {
      id: t.token_id || tokenId,
      name: t.name || "Unknown",
      symbol: t.symbol || "???",
      creator: t.creator?.account_id || t.creator || "",
      imageUrl: t.image_uri,
      description: t.description,
      graduated: t.is_graduated ?? false,
      createdAt: t.created_at ? String(t.created_at) : undefined,
    };
  }

  /**
   * Get current market data (price, holders, volume).
   * API returns { market_info: { token_id, price, holder_count, ... } }
   */
  async getMarket(tokenId: string): Promise<TokenMarket> {
    const raw = await this.request<any>(`/agent/market/${tokenId}`);
    const m = raw.market_info || raw;
    return {
      tokenId: m.token_id || tokenId,
      price: m.price_native || m.price || "0",
      priceUsd: m.price_usd || m.price,
      marketCap: m.market_cap,
      volume24h: m.volume,
      holders: m.holder_count,
      buyCount: m.buy_count,
      sellCount: m.sell_count,
    };
  }

  /**
   * Get trading metrics by timeframe.
   * API returns { metrics: { ... } }
   */
  async getMetrics(tokenId: string, timeframe = "1h"): Promise<TokenMetrics> {
    const raw = await this.request<any>(
      `/agent/metrics/${tokenId}?timeframes=${timeframe}`
    );
    const m = raw.metrics || raw;
    return {
      tokenId: m.token_id || tokenId,
      timeframe: m.timeframe || timeframe,
      priceChange: m.price_change,
      volumeChange: m.volume_change,
      buyVolume: m.buy_volume,
      sellVolume: m.sell_volume,
      netFlow: m.net_flow,
    };
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
    // Token and market are required; metrics and chart are optional
    const [token, market] = await Promise.all([
      this.getToken(tokenId),
      this.getMarket(tokenId),
    ]);

    let metrics: TokenMetrics = { tokenId, timeframe: "1h" };
    let chart: ChartCandle[] = [];
    try { metrics = await this.getMetrics(tokenId); } catch { /* non-critical */ }
    try { chart = await this.getChart(tokenId); } catch { /* non-critical */ }

    return { token, market, metrics, chart };
  }
}
