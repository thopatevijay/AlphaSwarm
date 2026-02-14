import Header from "../components/Header";
import LiveFeed from "../components/LiveFeed";
import AgentPanel from "../components/AgentPanel";
import Portfolio from "../components/Portfolio";
import TokenRadar from "../components/TokenRadar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 uppercase">Agents</p>
            <p className="text-2xl font-bold text-gray-100">4</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 uppercase">Strategy</p>
            <p className="text-2xl font-bold text-amber-400">Syndicate</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 uppercase">Blockchain</p>
            <p className="text-2xl font-bold text-purple-400">Monad</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 uppercase">Platform</p>
            <p className="text-2xl font-bold text-green-400">nad.fun</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left column — Feed */}
          <div className="col-span-2 space-y-6">
            <Portfolio />
            <LiveFeed />
          </div>

          {/* Right column — Agents + Radar */}
          <div className="space-y-6">
            <AgentPanel />
            <TokenRadar />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-4">
        <p className="text-center text-xs text-gray-600">
          AlphaSwarm Autonomous Venture Syndicate — 4 AI agents, 1 fund, zero humans
        </p>
      </footer>
    </div>
  );
}
