"use client";
import { useEffect, useState } from "react";
import { LoginEvent, loadJSON, saveJSON } from "@/lib/store";

export default function SecurityPage() {
  const [twoFA, setTwoFA] = useState(false);
  const [keys, setKeys] = useState<{ id: string; name: string; prefix: string }[]>([]);
  const [logs, setLogs] = useState<LoginEvent[]>([]);
  const [keyName, setKeyName] = useState("");

  useEffect(() => {
    setTwoFA(loadJSON("pasiya_2fa", false));
    setKeys(loadJSON("pasiya_api_keys", []));
    const existing = loadJSON<LoginEvent[]>("pasiya_login_logs", []);
    const entry: LoginEvent = {
      id: crypto.randomUUID(),
      at: Date.now(),
      ip: "client",
      device: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 48) : "web",
      ok: true
    };
    const next = [entry, ...existing].slice(0, 50);
    saveJSON("pasiya_login_logs", next);
    setLogs(next);
  }, []);

  function toggle2fa() {
    const v = !twoFA;
    setTwoFA(v);
    saveJSON("pasiya_2fa", v);
  }

  function addKey() {
    if (!keyName.trim()) return;
    const prefix = "pk_live_" + Math.random().toString(36).slice(2, 10);
    const next = [{ id: crypto.randomUUID(), name: keyName, prefix }, ...keys];
    setKeys(next); saveJSON("pasiya_api_keys", next); setKeyName("");
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold text-white">Security Center</h1>
      <div className="card flex items-center justify-between">
        <div>
          <div className="font-semibold">Two-factor authentication</div>
          <div className="text-xs text-muted">UI flag — enable real 2FA via Supabase Auth MFA</div>
        </div>
        <button className="btn-solid" onClick={toggle2fa}>{twoFA ? "On" : "Off"}</button>
      </div>
      <div className="card space-y-2">
        <div className="font-semibold">API Key Manager</div>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Key name" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
          <button className="btn" onClick={addKey}>Create</button>
        </div>
        <ul className="text-sm space-y-1">
          {keys.map((k) => (
            <li key={k.id} className="flex justify-between border-b border-line py-2">
              <span>{k.name}</span>
              <code className="text-accent text-xs">{k.prefix}…</code>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">Login history</div>
        <ul className="text-xs space-y-2 max-h-48 overflow-y-auto">
          {logs.map((l) => (
            <li key={l.id} className="text-muted">
              {new Date(l.at).toLocaleString()} · {l.device} · {l.ok ? "OK" : "FAIL"}
            </li>
          ))}
        </ul>
      </div>
      <div className="card text-sm text-muted">
        Firewall logs: app-level request logging only (browser cannot control device firewall).
      </div>
    </div>
  );
}
