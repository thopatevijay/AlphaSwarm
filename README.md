# AlphaSwarm — Autonomous Venture Syndicate

**4 AI agents that autonomously analyze, debate, and trade tokens on Monad. No humans in the loop.**

AlphaSwarm is a collective of 4 AI agents that form an autonomous venture syndicate on the Monad blockchain. They monitor new token launches on [nad.fun](https://nad.fun), analyze them with distinct strategies, debate investments publicly on [Moltbook](https://moltbook.com/m/alphaswarm), vote, and execute trades — all without human intervention.

Built for the [Moltiverse Hackathon](https://moltiverse.dev).

## Live Demo

| Service | URL |
|---------|-----|
| Dashboard | [alpha-swarm-moltiverse.vercel.app](https://alpha-swarm-moltiverse.vercel.app/) |
| Backend API | [alphaswarm-backend-production.up.railway.app](https://alphaswarm-backend-production.up.railway.app/api/health) |
| Moltbook Debates | [moltbook.com/m/alphaswarm](https://moltbook.com/m/alphaswarm) |

### Verified On-Chain Trades (Monad Mainnet)

| Action | Token | Amount | Tx Hash |
|--------|-------|--------|---------|
| Autonomous Buy | ClawNad ($CLAWN) | 0.1 MON | [`0x1c7ddae3...`](https://monad.socialscan.io/tx/0x1c7ddae3a9ec89587819d07f2aee1f1be89613cf3e96e9c603d3b44883d95979) |
| Manual Buy | ClawNad ($CLAWN) | 0.1 MON | [`0xe4c1d41d...`](https://monad.socialscan.io/tx/0xe4c1d41d758be02c3257cfdd785a2c66fd4bcdd6b9fc2b7e8f20b52f2400178d) |
| Manual Sell | ClawNad ($CLAWN) | 153.69 CLAWN | [`0x57ccce81...`](https://monad.socialscan.io/tx/0x57ccce81cfd8e484a8a8e6f67203d7ba7d3ce8694745551fa196b465c22313e5) |

---

## How It Works

```
New Token Detected (nad.fun)
  → Data Gathering (price, volume, holders, curve progress)
  → 4 AI Agents Analyze (each with a different strategy)
  → Public Debate on Moltbook (m/alphaswarm)
  → Weighted Vote (threshold: score >= 5.5, 2+ YES votes)
  → Trade Execution (buy via bonding curve on Monad)
  → Portfolio Monitoring (take profit +50% / stop loss -30%)
```

### The Pipeline in Detail

1. **Token Discovery** — The scanner monitors nad.fun for new token launches on the bonding curve. Tokens that have already graduated are skipped.

2. **Data Gathering** — For each token, the system fetches market data (price, volume, holders, buy/sell counts), bonding curve metrics (graduation progress, price changes), and metadata (name, description, creator).

3. **Agent Analysis** — Each of the 4 agents analyzes the token independently using a real LLM (OpenAI gpt-4o-mini). Each agent has a unique personality, strategy, and scoring criteria. They produce a score (1-10), a YES/NO vote, confidence level, and a written analysis.

4. **Moltbook Debate** — Analyses are posted publicly to the [m/alphaswarm](https://moltbook.com/m/alphaswarm) submolt on Moltbook. Each post requires solving an obfuscated math verification challenge (auto-solved by the system). This creates a transparent, public record of every investment decision.

5. **Weighted Vote** — Scores are weighted by agent expertise (CONTRARIAN has 1.2x weight as the risk analyst). A token passes if the weighted score >= 5.5 and at least 2 agents vote YES.

6. **Trade Execution** — If approved, the system buys the token via the nad.fun bonding curve router on Monad mainnet using viem. The transaction is signed with the syndicate wallet.

7. **Portfolio Monitoring** — Holdings are tracked with take-profit (+50%) and stop-loss (-30%) thresholds. The system checks positions every 5 minutes and auto-exits when thresholds are hit.

## Agent Personas

| Agent | Strategy | Personality | Weight |
|-------|----------|-------------|--------|
| **ALPHA** | Quantitative — curves, ratios, velocity | Data-driven, speaks in numbers | 1.0x |
| **DEGEN** | Momentum — volume spikes, social buzz | Aggressive, uses crypto slang | 0.8x |
| **SAGE** | Fundamental — metadata, creator, concept | Thoughtful, philosophical | 1.0x |
| **CONTRARIAN** | Risk — red flags, whale concentration | Skeptical, devil's advocate | 1.2x |

Each agent has a distinct system prompt that shapes their analysis style, risk tolerance, and vocabulary. DEGEN tends to be bullish; CONTRARIAN tends to be bearish. This creates genuine debate and diverse perspectives.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard (Next.js)                    │
│          alpha-swarm-moltiverse.vercel.app               │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│                   Backend (Express)                       │
│       alphaswarm-backend-production.up.railway.app       │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌────────┐ │
│  │ Scanner │→ │Orchestr. │→ │ Vote Engine │→ │ Trader │ │
│  └─────────┘  └──────────┘  └────────────┘  └────────┘ │
│       │            │                              │      │
│  ┌────▼────┐  ┌────▼─────┐                  ┌────▼────┐ │
│  │ nad.fun │  │ LLM +    │                  │ Monad   │ │
│  │  API    │  │ Moltbook │                  │  Chain  │ │
│  └─────────┘  └──────────┘                  └─────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 5, TypeScript |
| AI/LLM | OpenAI gpt-4o-mini (primary), Claude API (fallback) |
| Blockchain | Monad mainnet, viem |
| Social | Moltbook API with auto-verification solver |
| Token Data | nad.fun Agent API |
| Database | SQLite (better-sqlite3) |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Charts | Recharts |
| Deployment | Vercel (dashboard), Railway (backend) |

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

### Trigger Analysis

```bash
# Analyze a specific token
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"tokenIds": ["0xTOKEN_ADDRESS"]}'

# Manual buy
curl -X POST http://localhost:3001/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "0xTOKEN_ADDRESS", "amount": "0.1"}'

# Manual sell
curl -X POST http://localhost:3001/api/trade/sell \
  -H "Content-Type: application/json" \
  -d '{"tokenId": "0xTOKEN_ADDRESS"}'
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
| `/api/trade/buy` | POST | Manual token buy |
| `/api/trade/sell` | POST | Manual token sell |
| `/api/queue` | POST | Add tokens to scan queue |

## Project Structure

```
AlphaSwarm/
├── backend/              # Express + TypeScript
│   └── src/
│       ├── agents/       # 4 AI personas + prompts + mocks
│       ├── clients/      # LLM, Moltbook, nad.fun, Monad trader
│       │   ├── LLMClient.ts        # Multi-provider with fallback
│       │   ├── MoltbookClient.ts    # Auto-verification solver
│       │   ├── MonadTrader.ts       # Buy/sell via bonding curve
│       │   └── NadFunClient.ts      # Token data fetching
│       ├── core/         # Orchestrator, portfolio, vote engine, scanner
│       │   ├── orchestrator.ts      # Main pipeline coordinator
│       │   ├── voteEngine.ts        # Weighted voting system
│       │   ├── portfolio.ts         # Holdings + exit tracking
│       │   └── tokenScanner.ts      # Token discovery
│       ├── db/           # SQLite setup
│       └── types/        # Zod schemas + TypeScript types
├── dashboard/            # Next.js 16 + Tailwind
│   └── src/
│       ├── app/          # Pages
│       ├── components/   # Header, LiveFeed, AgentPanel, Portfolio, TokenRadar
│       └── lib/          # API client, types, utils
└── scripts/              # Setup and testing scripts
```

## Key Features

- **Fully Autonomous** — From token discovery to trade execution, no human input required
- **Multi-Agent Debate** — 4 agents with distinct strategies create genuine investment discourse
- **On-Chain Execution** — Real trades on Monad mainnet via nad.fun bonding curves
- **Public Transparency** — All analyses posted publicly on Moltbook for anyone to follow
- **Auto-Verification** — Solves Moltbook's obfuscated math challenges programmatically
- **LLM Fallback Chain** — Cache → Mock → Claude → OpenAI for resilience
- **Live Dashboard** — Real-time portfolio, event feed, and agent status monitoring
- **Risk Management** — Weighted voting, take-profit, and stop-loss built in

## License

MIT
