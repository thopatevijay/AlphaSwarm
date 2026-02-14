# AlphaSwarm — Autonomous Venture Syndicate

**4 AI agents that autonomously analyze, debate, and trade tokens on Monad. No humans in the loop.**

AlphaSwarm is a collective of 4 AI agents that form an autonomous venture syndicate on the Monad blockchain. They monitor new token launches on [nad.fun](https://nad.fun), analyze them with distinct strategies, debate investments publicly on [Moltbook](https://moltbook.com), vote, and execute trades — all without human intervention.

Built for the [Moltiverse Hackathon](https://moltiverse.dev).

---

## How It Works

```
New Token Detected (nad.fun)
  → Data Gathering (price, volume, holders, curve progress)
  → 4 Agents Analyze (each with different strategy)
  → Public Debate on Moltbook (m/alphaswarm)
  → Weighted Vote (threshold: score ≥ 6.0, 3+ YES, no critical flag)
  → Trade Execution (buy via bonding curve on Monad)
  → Portfolio Monitoring (take profit +50% / stop loss -30%)
```

## Agent Personas

| Agent | Strategy | Personality | Weight |
|-------|----------|-------------|--------|
| **ALPHA** | Quantitative — curves, ratios, velocity | Data-driven, speaks in numbers | 1.0x |
| **DEGEN** | Momentum — volume spikes, social buzz | Aggressive, uses crypto slang | 0.8x |
| **SAGE** | Fundamental — metadata, creator, concept | Thoughtful, philosophical | 1.0x |
| **CONTRARIAN** | Risk — red flags, whale concentration | Skeptical, devil's advocate | 1.2x |

## Architecture

- **Backend**: Node.js / TypeScript with Express
- **LLM**: Claude (primary) + OpenAI (fallback) with mock mode for dev
- **Blockchain**: Monad via viem — buy/sell through bonding curve router
- **Social**: Moltbook API — agents post analyses and debate publicly
- **Token Data**: nad.fun Agent API — market data, metrics, charts
- **Database**: SQLite (better-sqlite3) — events, holdings, cache
- **Dashboard**: Next.js 16 with Tailwind CSS — live feed, portfolio, agent status

## Quick Start

### Prerequisites

- Node.js 18+
- API keys: Anthropic (Claude) and/or OpenAI

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

### 3. Generate Wallet & Fund

```bash
npx tsx scripts/fund-wallet.ts --generate
# Copy the private key to backend/.env
npx tsx scripts/fund-wallet.ts
```

### 4. Register Agents on Moltbook

```bash
npx tsx scripts/register-agents.ts
# Copy the API keys to backend/.env
```

### 5. Create Submolt

```bash
npx tsx scripts/setup-submolt.ts
```

### 6. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Dashboard
cd dashboard && npm run dev
```

Open http://localhost:3000 for the dashboard.

### Dev Modes

```bash
# Mock LLM (no API costs)
cd backend && npm run dev:mock

# Dry Run (no trades or Moltbook posts)
cd backend && npm run dev:dry
```

### Trigger Analysis

```bash
# Analyze a specific token
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"tokenIds": ["0xTOKEN_ADDRESS"]}'

# Add tokens to the scanner queue
curl -X POST http://localhost:3001/api/queue \
  -H "Content-Type: application/json" \
  -d '{"tokenIds": ["0xTOKEN_ADDRESS"]}'
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System status, wallet, balance |
| `/api/feed` | GET | Event timeline |
| `/api/portfolio` | GET | Holdings and P&L |
| `/api/agents` | GET | Agent statuses |
| `/api/tokens` | GET | Analyzed tokens |
| `/api/analyze` | POST | Trigger token analysis |
| `/api/queue` | POST | Add tokens to scan queue |

## Project Structure

```
AlphaSwarm/
├── backend/              # Express + TypeScript
│   └── src/
│       ├── agents/       # 4 AI personas + prompts + mocks
│       ├── clients/      # LLM, Moltbook, nad.fun, Monad trader
│       ├── core/         # Orchestrator, portfolio, vote engine, scanner
│       ├── db/           # SQLite setup
│       └── types/        # Zod schemas + TypeScript types
├── dashboard/            # Next.js 16 + Tailwind
│   └── src/
│       ├── app/          # Pages
│       ├── components/   # Header, LiveFeed, AgentPanel, Portfolio, TokenRadar
│       └── lib/          # API client, types, utils
└── scripts/              # Setup and testing scripts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript |
| AI/LLM | Claude API, OpenAI API (fallback) |
| Blockchain | Monad, viem |
| Social | Moltbook API |
| Token Data | nad.fun Agent API |
| Database | SQLite (better-sqlite3) |
| Frontend | Next.js 16, Tailwind CSS |
| Execution | tsx (TypeScript runtime) |

## License

MIT
