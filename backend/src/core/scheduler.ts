import cron from "node-cron";
import { Orchestrator } from "./orchestrator.js";

// Seed list of known active nad.fun mainnet tokens for auto-discovery.
// The scanner automatically skips tokens that have already been analyzed.
const SEED_TOKENS: string[] = [
  "0x64F1416846cb28C805D7D82Dc49B81aB51567777", // ClawNad (CLAWN)
  "0x86c68d4FE7836A9FA13C88E8Ed1b9A21F48E7777", // Buidlbook (BOOK)
  "0xF5cBDCB063f65EA1CF5d5cDcfc81bF283Cb37777", // Narkina5
  "0x6A93a2c67955b4eA210333514eC9103C6bC67777", // cockmas
  "0x31BbbB9205d6F354833B80cdCd788182b7037777", // Relayer (REAI)
  "0xF68287D696e77fe377999900eb85071Be0e07777", // Metanad (METANAD)
];

export class Scheduler {
  private orchestrator: Orchestrator;
  private tokenFeed: string[] = [];
  private seeded = false;

  constructor(orchestrator: Orchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Add token addresses to the scan queue.
   */
  addTokens(tokenIds: string[]): void {
    this.tokenFeed.push(...tokenIds);
    console.log(`[Scheduler] Added ${tokenIds.length} tokens to queue (total: ${this.tokenFeed.length})`);
  }

  /**
   * Start periodic scanning and portfolio monitoring.
   */
  start(): void {
    console.log("[Scheduler] Starting periodic jobs...");

    // Auto-seed on startup after a short delay
    setTimeout(() => {
      if (!this.seeded) {
        this.seeded = true;
        this.addTokens(SEED_TOKENS);
        console.log(`[Scheduler] Auto-seeded ${SEED_TOKENS.length} tokens for autonomous discovery`);
      }
    }, 5000);

    // Scan for new tokens every 60 seconds — process 1 at a time
    // (each analysis takes ~5 min due to Moltbook comment delays)
    cron.schedule("*/60 * * * * *", async () => {
      if (this.tokenFeed.length === 0) return;

      const batch = this.tokenFeed.splice(0, 1);
      console.log(`[Scheduler] Processing ${batch.length} token from queue (${this.tokenFeed.length} remaining)...`);

      try {
        await this.orchestrator.analyzeTokens(batch);
      } catch (err) {
        console.error("[Scheduler] Analysis cycle error:", err);
      }
    });

    // Check portfolio exits every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      console.log("[Scheduler] Checking portfolio exits...");
      try {
        await this.orchestrator.checkExits();
      } catch (err) {
        console.error("[Scheduler] Exit check error:", err);
      }
    });

    console.log("[Scheduler] Cron jobs active — token scan every 60s, exit check every 5m");
  }
}
