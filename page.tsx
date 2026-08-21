"use client";
import { useEffect, useState } from "react";
import { MarketApp, loadJSON, saveJSON } from "@/lib/store";

const CATALOG: MarketApp[] = [
  { id: "weather", name: "Weather Widget", desc: "Desktop weather chip", installed: false },
  { id: "stocks", name: "Stock Ticker", desc: "Simple ticker strip", installed: false },
  { id: "notes", name: "Sticky Notes+", desc: "Enhanced notes pack", installed: false },
  { id: "pomodoro", name: "Pomodoro Timer", desc: "Focus timer app", installed: false },
  { id: "markdown", name: "Markdown Preview", desc: "MD viewer for Web Studio", installed: false },
  { id: "qr", name: "QR Generator", desc: "Make QR codes", installed: false }
];

export default function MarketplacePage() {
  const [apps, setApps] = useState<MarketApp[]>(CATALOG);

  useEffect(() => {
    const saved = loadJSON<MarketApp[]>("pasiya_marketplace", CATALOG);
    setApps(saved);
  }, []);

  function toggle(id: string) {
    const next = apps.map((a) => (a.id === id ? { ...a, installed: !a.installed } : a));
    setApps(next);
    saveJSON("pasiya_marketplace", next);
  }

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-xl font-bold text-white">Marketplace</h1>
      <p className="text-sm text-muted">Install widgets/apps into your workspace (local registry).</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {apps.map((a) => (
          <div key={a.id} className="card flex flex-col gap-2">
            <div className="font-semibold text-white">{a.name}</div>
            <p className="text-xs text-muted flex-1">{a.desc}</p>
            <button className={a.installed ? "btn" : "btn-solid"} onClick={() => toggle(a.id)}>
              {a.installed ? "Uninstall" : "Install"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
