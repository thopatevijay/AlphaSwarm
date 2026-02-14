import cron from "node-cron";
import { Orchestrator } from "./orchestrator.js";

export class Scheduler {
  private orchestrator: Orchestrator;
  private tokenFeed: string[] = [];

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

    // Scan for new tokens every 60 seconds
    cron.schedule("*/60 * * * * *", async () => {
      if (this.tokenFeed.length === 0) return;

      const batch = this.tokenFeed.splice(0, 3); // Process up to 3 tokens per cycle
      console.log(`[Scheduler] Processing ${batch.length} tokens from queue...`);

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
