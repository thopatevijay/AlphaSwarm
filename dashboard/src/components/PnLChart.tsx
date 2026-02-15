"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { api } from "../lib/api";

interface TokenScore {
  name: string;
  score: number;
  decision: string;
}

export default function PnLChart() {
  const [data, setData] = useState<TokenScore[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { tokens } = await api.tokens();
        const scores: TokenScore[] = tokens
          .filter((t: any) => t.weighted_score != null)
          .map((t: any) => ({
            name: t.token_symbol || t.token_name,
            score: Number(t.weighted_score),
            decision: t.decision || "PENDING",
          }))
          .sort((a: TokenScore, b: TokenScore) => b.score - a.score);
        setData(scores);
      } catch {
        /* backend not running */
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="section-header">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Swarm Verdict
          </h2>
        </div>
        <div className="px-5 py-12 text-center">
          <div className="text-2xl text-gray-700 mb-2">&middot;&middot;&middot;</div>
          <p className="text-sm text-gray-600">
            Waiting for token analyses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header justify-between">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Swarm Verdict
        </h2>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            INVEST
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            PASS
          </span>
        </div>
      </div>
      <div className="px-3 pb-4" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "#374151" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "#374151" }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: any, _name: any, props: any) => [
                `${Number(value).toFixed(2)} / 10`,
                props.payload.decision,
              ]}
              labelStyle={{ color: "#9ca3af" }}
            />
            <ReferenceLine
              y={4.5}
              stroke="#f59e0b"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: "Threshold 4.5",
                fill: "#f59e0b",
                fontSize: 9,
                position: "right",
              }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.decision === "INVEST" ? "#22c55e" : "#f59e0b"}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
