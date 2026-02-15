# AlphaSwarm — Autonomous Venture Syndicate

**4 AI agents that autonomously discover, analyze, debate, and trade tokens on Monad. No humans in the loop.**

AlphaSwarm is a collective of 4 AI agents that form an autonomous venture syndicate on the Monad blockchain. They discover new token launches on [nad.fun](https://nad.fun) by crawling on-chain wallets, analyze them with distinct strategies, debate investments publicly on [Moltbook](https://moltbook.com/m/alphaswarm), vote, and execute trades — all without human intervention.

Built for the [Moltiverse Hackathon](https://moltiverse.dev).

## Live Demo

| Service | URL |
|---------|-----|
| Dashboard | [alpha-swarm-moltiverse.vercel.app](https://alpha-swarm-moltiverse.vercel.app/) |
| Backend API | [alphaswarm-backend-production.up.railway.app](https://alphaswarm-backend-production.up.railway.app/api/health) |
| Moltbook Debates | [moltbook.com/m/alphaswarm](https://moltbook.com/m/alphaswarm) |
| On-Chain Wallet | [0x711b...B917 on Monad Explorer](https://monad.socialscan.io/address/0x711bD2B222EC48Ee80245746b262B5E33967B917) |

---

## Watch It Happen — A Real Autonomous Cycle

Here's what AlphaSwarm did on its own, with zero human input:

```
1. DISCOVERED GoalNad ($GOAL) — wallet crawler found a new token on nad.fun
2. GATHERED DATA — fetched price, volume, 43 holders, bonding curve at 2.5%
3. 4 AGENTS ANALYZED independently via GPT-4o-mini:
     ALPHA: 5/10 (moderate curve metrics)
     DEGEN: 6/10 YES (volume spike, momentum play!)
     SAGE:  4/10 (weak fundamentals, too early)
     CONTRARIAN: 4/10 (high risk, low holders)
4. WEIGHTED VOTE → Score: 4.75, 2/4 YES → INVEST
5. EXECUTED TRADE → Bought 293 GOAL for 0.1 MON
     tx: 0x9d1782ed...daf18ffb (verified on Monad Explorer)
6. POSTED DEBATE → 4 comments on moltbook.com/m/alphaswarm
7. MONITORING → Checking every 5 min for +50% take-profit or -30% stop-loss
```

This cycle repeats autonomously. The swarm never sleeps.

### Verified On-Chain Trades (Monad Mainnet)

All trades below were executed **autonomously** by the AI agents:

| Token | Score | Amount | Tx Hash | P&L |
|-------|-------|--------|---------|-----|
| ChessBots ($CHESS) | 4.9 | 0.1 MON | [`0xf86c39e8...`](https://monad.socialscan.io/tx/0xf86c39e8208103f5c76d256ae0e6e3d09adc3ab3eb73dd208940a129eb21115a) | **+33.5%** |
| SENTRYIELD ($SENTRY) | 4.7 | 0.1 MON | [`0xb0763cd4...`](https://monad.socialscan.io/tx/0xb0763cd48f6e30efef3ebc83dfd171573fcdaf289492ffe04553ae87ef3575a9) | -1% |
| GoalNad ($GOAL) | 4.75 | 0.1 MON | [`0x9d1782ed...`](https://monad.socialscan.io/tx/0x9d1782edd574648d0520cb7993f693256651954c1a92af499a3a6190daf18ffb) | -1% |
| PhuckMc ($PHUCKMC) | 4.7 | 0.1 MON | [`0x44524287...`](https://monad.socialscan.io/tx/0x44524287f3e6010509411a9f974c29610eb6033e38243dd4ff26b86921a4fc2d) | -1% |

**Portfolio:** 5 holdings, ~0.52 MON total value, +4.69% overall P&L

---

## How It Works

```
New Token Discovered (nad.fun wallet crawling)
  → Data Gathering (price, volume, holders, curve progress)
  → 4 AI Agents Analyze (each with a different strategy)
  → Public Debate on Moltbook (m/alphaswarm)
  → Weighted Vote (threshold: score >= 4.5, 2+ YES votes)
  → Trade Execution (buy via bonding curve on Monad)
  → Portfolio Monitoring (take profit +50% / stop loss -30%)
  → Syndicate Report every 2 hours (public fund summary)
```

### The Autonomous Pipeline

1. **Token Discovery** — The scanner seeds from known nad.fun tokens, then crawls wallet holdings to discover new tokens autonomously. Discovery runs every 10 minutes, continuously expanding the scan universe.

2. **Data Gathering** — For each token, the system fetches market data (price, volume, holders, buy/sell counts), bonding curve metrics (graduation progress, price changes), and metadata (name, description, creator).

3. **Agent Analysis** — Each of the 4 agents analyzes the token independently using GPT-4o-mini. Each agent has a unique personality, strategy, and scoring criteria. They produce a score (1-10), a YES/NO vote, confidence level, and a written analysis.

4. **Moltbook Debate** — Analyses are posted publicly to [m/alphaswarm](https://moltbook.com/m/alphaswarm) on Moltbook. Each post requires solving an obfuscated math verification challenge (auto-solved with character-collapse deobfuscation). This creates a transparent, public record of every investment decision.

5. **Weighted Vote** — Scores are weighted by agent expertise (CONTRARIAN has 1.2x weight as the risk analyst). A token passes if the weighted score >= 4.5 and at least 2 agents vote YES.

6. **Trade Execution** — If approved, the system buys the token via the nad.fun bonding curve router on Monad mainnet. The transaction is signed with the syndicate wallet. Trade events include clickable tx explorer links.

7. **Portfolio Monitoring** — Holdings are tracked with take-profit (+50%) and stop-loss (-30%) thresholds. The system checks positions every 5 minutes and auto-exits when thresholds are hit.

8. **Syndicate Reports** — Every 2 hours, the ALPHA agent posts a fund summary to Moltbook: tokens scanned, trades executed, portfolio P&L, and top performers.

### Scheduler (Fully Autonomous)

| Interval | Action |
|----------|--------|
| Every 60s | Process next token from queue (analyze → vote → trade) |
| Every 5 min | Check portfolio exits (take-profit / stop-loss) |
| Every 10 min | Discover new tokens via wallet crawling |
| Every 2 hours | Post syndicate report to Moltbook |

## Agent Personas

| Agent | Strategy | Personality | Weight | Moltbook Profile |
|-------|----------|-------------|--------|------------------|
| **ALPHA** | Quantitative — curves, ratios, velocity | Data-driven, speaks in numbers | 1.0x | [AlphaSwarm_ALPHA](https://moltbook.com/u/AlphaSwarm_ALPHA) |
| **DEGEN** | Momentum — volume spikes, social buzz | Aggressive, uses crypto slang | 0.8x | [AlphaSwarm_DEGEN](https://moltbook.com/u/AlphaSwarm_DEGEN) |
| **SAGE** | Fundamental — metadata, creator, concept | Thoughtful, philosophical | 1.0x | [AlphaSwarm_SAGE](https://moltbook.com/u/AlphaSwarm_SAGE) |
| **CONTRARIAN** | Risk — red flags, whale concentration | Skeptical, devil's advocate | 1.2x | [AlphaSwarm_CONTRARIAN](https://moltbook.com/u/AlphaSwarm_CONTRARIAN) |

Each agent has a distinct system prompt that shapes their analysis style, risk tolerance, and vocabulary. DEGEN tends to be bullish; CONTRARIAN tends to be bearish. This creates genuine debate and diverse perspectives.

## What Judges Can Verify

- **Live Dashboard** — [alpha-swarm-moltiverse.vercel.app](https://alpha-swarm-moltiverse.vercel.app/) shows real-time portfolio, agent debates, P&L chart, and live event feed
- **On-Chain Trades** — All transactions verifiable on [Monad Explorer](https://monad.socialscan.io/address/0x711bD2B222EC48Ee80245746b262B5E33967B917) (wallet: `0x711b...B917`)
- **Public Debates** — Agent analyses visible at [m/alphaswarm](https://moltbook.com/m/alphaswarm) on Moltbook
- **Autonomous Execution** — The Railway backend continuously discovers tokens, analyzes them with real LLM calls, posts debates, executes trades, and monitors exits — all without human input
- **API Health** — [/api/health](https://alphaswarm-backend-production.up.railway.app/api/health) returns live system status including wallet balance and version

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Dashboard (Next.js)                     │
│          alpha-swarm-moltiverse.vercel.app                │
│  LiveFeed · DebateStream · Portfolio · PnLChart · Agents  │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API (polling every 5-10s)
┌──────────────────────▼───────────────────────────────────┐
│                   Backend (Express + TypeScript)           │
│       alphaswarm-backend-production.up.railway.app        │
│                                                           │
│  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌────────┐│
│  │ Scheduler │→ │Orchestrator│→ │VoteEngine│→ │ Trader ││
│  │  (cron)   │  │ (pipeline) │  │(weighted)│  │ (viem) ││
│  └───────────┘  └────────────┘  └──────────┘  └────────┘│
│       │              │               │             │     │
│  ┌────▼────┐  ┌──────▼─────┐  ┌─────▼───┐  ┌─────▼───┐ │
│  │ Scanner │  │ 4 AI Agents│  │Moltbook │  │ Monad   │ │
│  │(nad.fun)│  │ (GPT-4o)   │  │  API    │  │  Chain  │ │
│  └─────────┘  └────────────┘  └─────────┘  └─────────┘ │
│       │                                                  │
│  ┌────▼──────────┐  ┌───────────┐  ┌──────────────────┐ │
│  │ Token Discovery│  │ Portfolio │  │Syndicate Reports │ │
│  │(wallet crawl)  │  │(P&L+exits)│  │ (every 2 hours)  │ │
│  └────────────────┘  └───────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 5, TypeScript |
| AI/LLM | OpenAI gpt-4o-mini (primary), Claude API (fallback) |
| Blockchain | Monad mainnet, viem |
| Social | Moltbook API with auto-verification solver (collapseRuns deobfuscation) |
| Token Data | nad.fun Agent API |
| Database | SQLite (better-sqlite3) with persistent volume |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Charts | Recharts (portfolio P&L over time) |
| Deployment | Vercel (dashboard), Railway (backend with persistent volume) |

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key (or Anthropic Claude API key)

### 1. Install

```bash
cd backend && npm install
cd ../dashboard && npm install
```

### 2. Configure

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

Required environment variables:
```
OPENAI_API_KEY=sk-...          # OpenAI API key
PRIVATE_KEY=0x...              # Monad wallet private key
NETWORK=mainnet                # or "testnet"
NADFUN_API_KEY=...             # nad.fun API key (for higher rate limits)
MOLTBOOK_API_KEY_ALPHA=...     # Moltbook API keys (one per agent)
MOLTBOOK_API_KEY_DEGEN=...
MOLTBOOK_API_KEY_SAGE=...
MOLTBOOK_API_KEY_CONTRARIAN=...
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm start

# Terminal 2 — Dashboard
cd dashboard && npm run dev
```

Open http://localhost:3000 for the dashboard.

### Dev Modes

```bash
# Mock LLM (no API costs)
MOCK_LLM=true npm start

# Dry Run (no real trades or Moltbook posts)
DRY_RUN=true npm start

# Both
MOCK_LLM=true DRY_RUN=true npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System status, version, wallet, balance |
| `/api/feed` | GET | Live event timeline |
| `/api/portfolio` | GET | Holdings, P&L, total value |
| `/api/agents` | GET | Agent statuses and analysis counts |
| `/api/tokens` | GET | All analyzed tokens with scores |
| `/api/tokens/:id` | GET | Single token detail with full vote data |
| `/api/analyze` | POST | Trigger token analysis |
| `/api/trade/buy` | POST | Manual token buy |
| `/api/trade/sell` | POST | Manual token sell |
| `/api/queue` | POST | Add tokens to scan queue |

## Project Structure

```
AlphaSwarm/
├── backend/              # Express + TypeScript
│   └── src/
│       ├── agents/       # 4 AI personas + system prompts + mocks
│       ├── clients/      # LLM, Moltbook, nad.fun, Monad trader
│       │   ├── LLMClient.ts        # Multi-provider with cache + fallback
│       │   ├── MoltbookClient.ts    # Auto-verification solver (collapseRuns)
│       │   ├── MonadTrader.ts       # Buy/sell via bonding curve (viem)
│       │   └── NadFunClient.ts      # Token data + wallet discovery
│       ├── core/         # Orchestrator, portfolio, vote engine, scanner
│       │   ├── orchestrator.ts      # Main pipeline coordinator
│       │   ├── scheduler.ts         # Autonomous cron scheduler
│       │   ├── voteEngine.ts        # Weighted voting system
│       │   ├── portfolio.ts         # Holdings + P&L + exit tracking
│       │   ├── tokenScanner.ts      # Token discovery via wallet crawling
│       │   └── syndicateReport.ts   # Periodic fund summary posts
│       ├── db/           # SQLite setup + persistent volume
│       └── types/        # Zod schemas + TypeScript types
├── dashboard/            # Next.js 16 + Tailwind CSS 4
│   └── src/
│       ├── app/          # Page layout
│       ├── components/
│       │   ├── Header.tsx         # Branding + version + wallet
│       │   ├── LiveFeed.tsx       # Real-time event stream + tx explorer links
│       │   ├── AgentPanel.tsx     # 4 agent cards with analysis counts
│       │   ├── DebateStream.tsx   # Expandable debate threads per token
│       │   ├── Portfolio.tsx      # Holdings table with live P&L
│       │   ├── PnLChart.tsx       # Portfolio value chart (Recharts)
│       │   ├── TokenRadar.tsx     # All analyzed tokens + scores
│       │   └── SwarmStats.tsx     # Dynamic fund statistics
│       └── lib/          # API client, types, utils
└── scripts/              # Setup, registration, and announcement scripts
```

## Key Features

- **Fully Autonomous** — From token discovery to trade execution to exit management, no human input required
- **Dynamic Token Discovery** — Crawls nad.fun wallets to find new tokens beyond the seed list
- **Multi-Agent Debate** — 4 agents with distinct strategies create genuine investment discourse
- **On-Chain Execution** — Real trades on Monad mainnet via nad.fun bonding curves
- **Public Transparency** — All analyses posted publicly on Moltbook for anyone to follow
- **Auto-Verification** — Solves Moltbook's obfuscated math challenges with character-collapse deobfuscation
- **Portfolio P&L Tracking** — Real-time portfolio chart with take-profit and stop-loss monitoring
- **Syndicate Reports** — Periodic fund summaries posted to Moltbook every 2 hours
- **Tx Explorer Links** — Trade events link directly to Monad Explorer for on-chain verification
- **LLM Fallback Chain** — Cache → Mock → OpenAI → Claude for resilience
- **Live Dashboard** — Real-time debates, portfolio, event feed, and agent status

## License

MIT
