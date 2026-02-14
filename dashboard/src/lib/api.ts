const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => fetchApi<any>("/api/health"),
  feed: (limit = 50) => fetchApi<{ events: any[] }>(`/api/feed?limit=${limit}`),
  portfolio: () => fetchApi<{ holdings: any[]; totalValue: string; totalPnl: string }>("/api/portfolio"),
  agents: () => fetchApi<{ agents: any[] }>("/api/agents"),
  tokens: () => fetchApi<{ tokens: any[] }>("/api/tokens"),
};
