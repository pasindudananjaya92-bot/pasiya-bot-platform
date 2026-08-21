"use client";
import { useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

type Hit = { at: number; path: string; country: string };

export default function AnalyticsPage() {
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const existing = loadJSON<Hit[]>("pasiya_analytics_hits", []);
    // record this view
    const next = [{ at: Date.now(), path: "/analytics", country: "LK" }, ...existing].slice(0, 500);
    saveJSON("pasiya_analytics_hits", next);
    setHits(next);
  }, []);

  const byDay = useMemo(() => {
    const map: Record<string, number> = {};
    hits.forEach((h) => {
      const d = new Date(h.at).toISOString().slice(0, 10);
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([day, views]) => ({ day: day.slice(5), views }));
  }, [hits]);

  const countries = useMemo(() => {
    const map: Record<string, number> = {};
    hits.forEach((h) => { map[h.country] = (map[h.country] || 0) + 1; });
    return Object.entries(map).map(([c, n]) => ({ c, n }));
  }, [hits]);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-xl font-bold text-white">Analytics Hub</h1>
      <p className="text-sm text-muted">Local event store (demo). Wire Supabase table <code className="text-accent">page_views</code> for multi-device.</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card"><div className="text-xs text-muted">Page views</div><div className="text-2xl font-bold text-accent">{hits.length}</div></div>
        <div className="card"><div className="text-xs text-muted">Live (session)</div><div className="text-2xl font-bold text-accent">1</div></div>
        <div className="card"><div className="text-xs text-muted">Top country</div><div className="text-2xl font-bold text-accent">{countries[0]?.c || "—"}</div></div>
      </div>
      <div className="card h-64">
        <div className="text-sm font-semibold mb-2">Views (14 days)</div>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={byDay}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid #134" }} />
            <Line type="monotone" dataKey="views" stroke="#00e5ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card h-56">
        <div className="text-sm font-semibold mb-2">Countries</div>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={countries}>
            <XAxis dataKey="c" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid #134" }} />
            <Bar dataKey="n" fill="#00e5ff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
