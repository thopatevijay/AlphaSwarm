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
  "0x148a3a811979e5BF8366FC279B2d67742Fe17777", // PhuckMc (PHUCKMC)
  "0x39D691612Ef8B4B884b0aA058f41C93d6B527777", // PKMONAD (PKMON)
];

export class Scheduler {
  private orchestrator: Orchestrator;
  private tokenFeed: string[] = [];
  private seeded = false;
  private busy = false;
  private discovering = false;

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
      if (this.busy || this.tokenFeed.length === 0) return;

      this.busy = true;
      const batch = this.tokenFeed.splice(0, 1);
      console.log(`[Scheduler] Processing ${batch.length} token from queue (${this.tokenFeed.length} remaining)...`);

      try {
        await this.orchestrator.analyzeTokens(batch);
      } catch (err) {
        console.error("[Scheduler] Analysis cycle error:", err);
      } finally {
        this.busy = false;
      }
    });

    // Dynamic token discovery — crawl the network every 10 minutes
    // Picks a random seed token and finds new tokens from active wallets
    cron.schedule("*/10 * * * *", async () => {
      if (this.discovering) return;
      this.discovering = true;

      try {
        const seed = SEED_TOKENS[Math.floor(Math.random() * SEED_TOKENS.length)];
        console.log(`[Scheduler] Running network discovery from ${seed.slice(0, 10)}...`);
        const newTokens = await this.orchestrator.discoverFromNetwork(seed);
        if (newTokens.length > 0) {
          this.addTokens(newTokens);
        }
      } catch (err) {
        console.error("[Scheduler] Discovery error:", err);
      } finally {
        this.discovering = false;
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

    // Post syndicate summary report every 2 hours
    cron.schedule("0 */2 * * *", async () => {
      console.log("[Scheduler] Posting syndicate report...");
      try {
        await this.orchestrator.postSyndicateReport();
      } catch (err) {
        console.error("[Scheduler] Syndicate report error:", err);
      }
    });

    // Post first report 5 minutes after startup
    setTimeout(async () => {
      try {
        await this.orchestrator.postSyndicateReport();
      } catch {
        // Non-critical
      }
    }, 5 * 60 * 1000);

    console.log("[Scheduler] Cron jobs active — scan 60s, discovery 10m, exits 5m, report 2h");
  }
}
