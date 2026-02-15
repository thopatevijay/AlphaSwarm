import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "..", "alphaswarm.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    migrate(db);
  }
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      agent TEXT,
      token_id TEXT,
      token_name TEXT,
      message TEXT NOT NULL,
      data TEXT,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS holdings (
      token_id TEXT PRIMARY KEY,
      token_name TEXT NOT NULL,
      token_symbol TEXT NOT NULL,
      amount TEXT NOT NULL,
      buy_price TEXT NOT NULL,
      buy_amount_mon TEXT NOT NULL,
      current_price TEXT,
      current_value_mon TEXT,
      pnl_percent REAL,
      buy_tx_hash TEXT NOT NULL,
      sell_tx_hash TEXT,
      status TEXT NOT NULL DEFAULT 'holding',
      bought_at INTEGER NOT NULL,
      sold_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS analyzed_tokens (
      token_id TEXT PRIMARY KEY,
      token_name TEXT,
      token_symbol TEXT,
      weighted_score REAL,
      decision TEXT,
      votes_json TEXT,
      discovered_at INTEGER NOT NULL,
      analyzed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS llm_cache (
      cache_key TEXT PRIMARY KEY,
      response TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_holdings_status ON holdings(status);
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
