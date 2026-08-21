"use client";

import { useEffect, useState } from "react";

type Msg = { role: "user" | "bot"; text: string };

export function AiAgentPanel() {
  const [webhook, setWebhook] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Agent ready. Save your n8n/Make webhook URL, then send a message." },
  ]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setWebhook(localStorage.getItem("pasiya_agent_webhook") || "");
    } catch {}
  }, []);

  function saveHook() {
    try {
      localStorage.setItem("pasiya_agent_webhook", webhook.trim());
      setMsgs((m) => [...m, { role: "bot", text: "Webhook saved on this device." }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: "Could not save webhook." }]);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text }]);
    const url = webhook.trim();
    if (!url) {
      setMsgs((m) => [
        ...m,
        { role: "bot", text: "No webhook URL. Paste n8n Production webhook and Save." },
      ]);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, source: "pasiya-max-cmd" }),
      });
      const raw = await res.text();
      let reply = raw;
      try {
        const j = JSON.parse(raw);
        reply =
          j.reply ||
          j.message ||
          j.text ||
          j.output ||
          (typeof j === "string" ? j : JSON.stringify(j));
      } catch {}
      setMsgs((m) => [...m, { role: "bot", text: String(reply).slice(0, 4000) || "(empty response)" }]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text:
            "Request failed (CORS or network). Use n8n CORS-enabled webhook or a proxy. " +
            String(e),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-accent">🤖 AI Agent</h1>
        <p className="text-white/55 text-sm">
          Posts to your webhook. Reply JSON fields: reply / message / text / output.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 rounded-xl bg-bg border border-border px-3 py-2 text-sm"
          placeholder="https://.../webhook/..."
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
        />
        <button
          type="button"
          onClick={saveHook}
          className="rounded-xl border border-border px-4 py-2 text-sm hover:border-accent/40"
        >
          Save URL
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-panel h-72 overflow-y-auto p-3 space-y-2">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={[
              "text-sm rounded-xl px-3 py-2 max-w-[90%]",
              m.role === "user"
                ? "ml-auto bg-accent/20 text-accent"
                : "bg-white/5 text-white/85",
            ].join(" ")}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl bg-bg border border-border px-3 py-2 text-sm"
          placeholder="Message the agent…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && send()}
          disabled={busy}
        />
        <button
          type="button"
          onClick={send}
          disabled={busy}
          className="rounded-xl bg-accent text-black font-semibold px-4 py-2 text-sm disabled:opacity-50"
        >
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
