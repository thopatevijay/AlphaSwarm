import Header from "../components/Header";
import LiveFeed from "../components/LiveFeed";
import AgentPanel from "../components/AgentPanel";
import Portfolio from "../components/Portfolio";
import TokenRadar from "../components/TokenRadar";
import SwarmStats from "../components/SwarmStats";

export default function Home() {
  return (
    <div className="min-h-screen relative z-10">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Dynamic stats bar */}
        <SwarmStats />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Portfolio />
            <LiveFeed />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <AgentPanel />
            <TokenRadar />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            AlphaSwarm Autonomous Venture Syndicate
          </p>
          <p className="text-xs text-gray-700">
            4 AI agents &middot; 1 fund &middot; zero humans
          </p>
        </div>
      </footer>
    </div>
  );
}
