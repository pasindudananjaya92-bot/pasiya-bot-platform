"use client";
import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/store";

type Settings = { supabaseUrl: string; supabaseAnon: string; n8nWebhook: string; displayName: string };

export default function SettingsPage() {
  const [s, setS] = useState<Settings>({ supabaseUrl: "", supabaseAnon: "", n8nWebhook: "", displayName: "Pasindu" });
  const [msg, setMsg] = useState("");
  useEffect(() => { setS(loadJSON("pasiya_saas_settings", s)); }, []);
  function save() {
    saveJSON("pasiya_saas_settings", s);
    if (s.n8nWebhook) saveJSON("pasiya_n8n_chat", s.n8nWebhook);
    setMsg("Saved locally. Production secrets → Vercel env.");
  }
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-bold text-white">Settings</h1>
      <label className="block text-xs text-muted">Display name</label>
      <input className="input" value={s.displayName} onChange={(e) => setS({ ...s, displayName: e.target.value })} />
      <label className="block text-xs text-muted">Supabase URL</label>
      <input className="input" value={s.supabaseUrl} onChange={(e) => setS({ ...s, supabaseUrl: e.target.value })} placeholder="https://xxx.supabase.co" />
      <label className="block text-xs text-muted">Supabase anon key</label>
      <input className="input" value={s.supabaseAnon} onChange={(e) => setS({ ...s, supabaseAnon: e.target.value })} />
      <label className="block text-xs text-muted">n8n Production webhook</label>
      <input className="input" value={s.n8nWebhook} onChange={(e) => setS({ ...s, n8nWebhook: e.target.value })} />
      <button className="btn-solid" onClick={save}>Save</button>
      {msg && <p className="text-sm text-accent">{msg}</p>}
      <div className="card text-xs text-muted">Stripe / billing keys → Vercel Environment Variables only.</div>
    </div>
  );
}
