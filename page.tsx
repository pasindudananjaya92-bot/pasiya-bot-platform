"use client";
import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/store";

export default function AIAgentPage() {
  const [hook, setHook] = useState("");
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ role: string; text: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setHook(loadJSON("pasiya_n8n_chat", "https://pasiyamax.app.n8n.cloud/webhook/"));
  }, []);

  async function send() {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    setLog((l) => [...l, { role: "you", text: msg }]);
    setBusy(true);
    try {
      if (hook && hook.startsWith("http") && !hook.endsWith("/webhook/")) {
        const r = await fetch(hook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg, text: msg })
        });
        const j = await r.json().catch(() => ({}));
        const reply = (j as any).reply || (j as any).message || (j as any).text || JSON.stringify(j).slice(0, 400);
        setLog((l) => [...l, { role: "agent", text: String(reply) }]);
      } else {
        setLog((l) => [...l, { role: "agent", text: "Paste full n8n Production webhook in the field above. Echo: " + msg }]);
      }
    } catch (e: any) {
      setLog((l) => [...l, { role: "agent", text: "Error: " + e.message }]);
    }
    setBusy(false);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold text-white">AI Agent</h1>
      <p className="text-sm text-muted">Chat via n8n Production webhook.</p>
      <input className="input" value={hook} onChange={(e) => { setHook(e.target.value); saveJSON("pasiya_n8n_chat", e.target.value); }} placeholder="https://….n8n.cloud/webhook/…" />
      <div className="card h-72 overflow-y-auto space-y-2 text-sm">
        {log.length === 0 && <div className="text-muted">No messages yet.</div>}
        {log.map((m, i) => (
          <div key={i} className={m.role === "you" ? "text-accent" : "text-slate-200"}>
            <b>{m.role === "you" ? "You" : "Agent"}:</b> {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…" />
        <button className="btn-solid" disabled={busy} onClick={send}>{busy ? "…" : "Send"}</button>
      </div>
    </div>
  );
}
