"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { SwarmEvent } from "../lib/types";
import { timeAgo, EVENT_COLORS, EVENT_ICONS, AGENT_CONFIG } from "../lib/utils";

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
    <div className="card overflow-hidden">
      <div className="section-header justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Live Feed
          </h2>
          {events.length > 0 && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-600 tabular-nums">
          {events.length} events
        </span>
      </div>

      <div className="max-h-[560px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="text-2xl text-gray-700 mb-2">&middot;&middot;&middot;</div>
            <p className="text-sm text-gray-600 mb-1">No events yet</p>
            <p className="text-xs text-gray-700">
              Waiting for the swarm to activate...
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/30">
            {events.map((event, i) => {
              const eventIcon = EVENT_ICONS[event.type] || EVENT_ICONS.system;
              return (
                <div
                  key={event.id || i}
                  className={`px-5 py-3 border-l-2 ${EVENT_COLORS[event.type] || "border-l-gray-700"} hover:bg-white/[0.02] transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Event icon */}
                      <span
                        className={`${eventIcon.color} text-xs mt-0.5 opacity-70 flex-shrink-0 w-3.5 text-center`}
                      >
                        {eventIcon.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          {event.agent && (
                            <span
                              className={`text-[11px] font-bold ${AGENT_CONFIG[event.agent]?.color || "text-gray-400"}`}
                            >
                              {event.agent.toUpperCase()}
                            </span>
                          )}
                          <span className="text-[13px] text-gray-400 leading-snug">
                            {event.message}
                          </span>
                        </div>
                        {event.token_name && (
                          <span className="inline-block mt-1.5 text-[10px] text-amber-500/80 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded">
                            {event.token_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-700 whitespace-nowrap mt-0.5 tabular-nums">
                      {timeAgo(event.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
