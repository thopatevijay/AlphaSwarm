import { getDb } from "../db/database.js";
import type { Holding } from "../types/index.js";

export class Portfolio {
  /**
   * Add a new holding.
   */
  addHolding(holding: Omit<Holding, "currentPrice" | "currentValueMON" | "pnlPercent" | "sellTxHash" | "soldAt">): void {
    const db = getDb();
    db.prepare(
      `INSERT OR REPLACE INTO holdings
       (token_id, token_name, token_symbol, amount, buy_price, buy_amount_mon, buy_tx_hash, status, bought_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      holding.tokenId,
      holding.tokenName,
      holding.tokenSymbol,
      holding.amount,
      holding.buyPrice,
      holding.buyAmountMON,
      holding.buyTxHash,
      holding.status,
      holding.boughtAt
    );
  }

  /**
   * Update an existing holding.
   */
  updateHolding(
    tokenId: string,
    updates: Partial<{
      currentPrice: string;
      currentValueMON: string;
      pnlPercent: number;
      sellTxHash: string;
      status: string;
      soldAt: number;
    }>
  ): void {
    const db = getDb();
    const sets: string[] = [];
    const values: any[] = [];

    if (updates.currentPrice !== undefined) {
      sets.push("current_price = ?");
      values.push(updates.currentPrice);
    }
    if (updates.currentValueMON !== undefined) {
      sets.push("current_value_mon = ?");
      values.push(updates.currentValueMON);
    }
    if (updates.pnlPercent !== undefined) {
      sets.push("pnl_percent = ?");
      values.push(updates.pnlPercent);
    }
    if (updates.sellTxHash !== undefined) {
      sets.push("sell_tx_hash = ?");
      values.push(updates.sellTxHash);
    }
    if (updates.status !== undefined) {
      sets.push("status = ?");
      values.push(updates.status);
    }
    if (updates.soldAt !== undefined) {
      sets.push("sold_at = ?");
      values.push(updates.soldAt);
    }

    if (sets.length === 0) return;

    values.push(tokenId);
    db.prepare(`UPDATE holdings SET ${sets.join(", ")} WHERE token_id = ?`).run(...values);
  }

  /**
   * Get all active (not sold) holdings.
   */
  getActiveHoldings(): Holding[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM holdings WHERE status = 'holding' ORDER BY bought_at DESC")
      .all() as any[];
    return rows.map(this.rowToHolding);
  }

  /**
   * Get all holdings (including sold).
   */
  getAllHoldings(): Holding[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM holdings ORDER BY bought_at DESC")
      .all() as any[];
    return rows.map(this.rowToHolding);
  }

  /**
   * Get portfolio summary.
   */
  getSummary(): { holdings: Holding[]; totalValue: string; totalPnl: string } {
    const holdings = this.getAllHoldings();
    let totalInvested = 0;
    let totalCurrent = 0;

    for (const h of holdings) {
      totalInvested += parseFloat(h.buyAmountMON) || 0;
      if (h.status === "holding") {
        totalCurrent += parseFloat(h.currentValueMON || h.buyAmountMON) || 0;
      } else if (h.status === "sold") {
        // For sold holdings, P&L is baked in
        const pnl = (h.pnlPercent || 0) / 100;
        totalCurrent += (parseFloat(h.buyAmountMON) || 0) * (1 + pnl);
      }
    }

    const totalPnl =
      totalInvested > 0
        ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(2)
        : "0";

    return {
      holdings,
      totalValue: totalCurrent.toFixed(4),
      totalPnl,
    };
  }

  private rowToHolding(row: any): Holding {
    return {
      tokenId: row.token_id,
      tokenName: row.token_name,
      tokenSymbol: row.token_symbol,
      amount: row.amount,
      buyPrice: row.buy_price,
      buyAmountMON: row.buy_amount_mon,
      currentPrice: row.current_price,
      currentValueMON: row.current_value_mon,
      pnlPercent: row.pnl_percent,
      buyTxHash: row.buy_tx_hash,
      sellTxHash: row.sell_tx_hash,
      status: row.status,
      boughtAt: row.bought_at,
      soldAt: row.sold_at,
    };
  }
}
