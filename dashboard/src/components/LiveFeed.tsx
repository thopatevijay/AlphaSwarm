"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { SwarmEvent } from "../lib/types";
import { timeAgo, EVENT_COLORS, AGENT_CONFIG } from "../lib/utils";

export default function LiveFeed() {
  const [events, setEvents] = useState<SwarmEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.feed();
        setEvents(data.events);
      } catch {
        /* backend not running */
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Live Feed
        </h2>
        <span className="text-xs text-gray-500">{events.length} events</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-800/50">
        {events.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-600">
            <p className="text-lg mb-1">No events yet</p>
            <p className="text-sm">Waiting for the swarm to activate...</p>
          </div>
        ) : (
          events.map((event, i) => (
            <div
              key={event.id || i}
              className={`px-4 py-3 border-l-2 ${EVENT_COLORS[event.type] || "border-l-gray-700"} hover:bg-gray-800/30 transition-colors`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {event.agent && (
                    <span
                      className={`text-xs font-bold ${AGENT_CONFIG[event.agent]?.color || "text-gray-400"} mr-2`}
                    >
                      {event.agent.toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm text-gray-300">{event.message}</span>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {timeAgo(event.timestamp)}
                </span>
              </div>
              {event.token_name && (
                <span className="inline-block mt-1 text-xs text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {event.token_name}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
