import Header from "../components/Header";
import LiveFeed from "../components/LiveFeed";
import AgentPanel from "../components/AgentPanel";
import Portfolio from "../components/Portfolio";
import TokenRadar from "../components/TokenRadar";

export default function Home() {
  return (
    <div className="min-h-screen relative z-10">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active Agents" value="4" accent="text-blue-400" />
          <StatCard label="Strategy" value="Syndicate" accent="text-amber-400" />
          <StatCard label="Blockchain" value="Monad" accent="text-purple-400" />
          <StatCard label="Platform" value="nad.fun" accent="text-emerald-400" />
        </div>

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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card px-4 py-3.5 group">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${accent} tracking-tight`}>{value}</p>
    </div>
  );
}
