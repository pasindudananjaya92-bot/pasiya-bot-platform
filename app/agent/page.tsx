"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AgentTerminal, {
  type TermLine,
} from "@/components/AgentTerminal";
import FileExplorer from "@/components/FileExplorer";
import DiffViewer from "@/components/DiffViewer";
import ApprovalGate, {
  type ApprovalPayload,
} from "@/components/ApprovalGate";

type ChatMsg = { role: "user" | "assistant"; content: string };

let lineId = 0;
function nextId() {
  lineId += 1;
  return `L${lineId}`;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<TermLine[]>([]);
  const [pending, setPending] = useState<ApprovalPayload | null>(null);
  const [memoryId, setMemoryId] = useState<string>("");
  const [diffPath, setDiffPath] = useState<string>("");
  const [diffAfter, setDiffAfter] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [assistantBuf, setAssistantBuf] = useState("");
  const [agentOn, setAgentOn] = useState<boolean | null>(null);
  const [adminSecret, setAdminSecret] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const historyRef = useRef<ChatMsg[]>([]);

  const pushLog = useCallback(
    (level: TermLine["level"], text: string) => {
      setLines((prev) => [
        ...prev,
        { id: nextId(), level, text, ts: Date.now() },
      ]);
    },
    []
  );

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/control");
      const data = await res.json();
      setAgentOn(!!data.enabled);
    } catch {
      setAgentOn(null);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    try {
      const s = localStorage.getItem("pasiya_agent_admin_secret");
      if (s) setAdminSecret(s);
    } catch {
      /* ignore */
    }
  }, [refreshStatus]);

  const toggleAgent = async (enabled: boolean) => {
    setAdminBusy(true);
    setAdminMsg("");
    try {
      if (adminSecret.trim()) {
        localStorage.setItem(
          "pasiya_agent_admin_secret",
          adminSecret.trim()
        );
      }
      const res = await fetch("/api/agent/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          secret: adminSecret.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAdminMsg(data.error || res.statusText);
      } else {
        setAgentOn(!!data.enabled);
        setAdminMsg(data.message || (enabled ? "ON" : "OFF"));
        pushLog(
          "info",
          enabled ? "Admin: Agent turned ON" : "Admin: Agent turned OFF"
        );
      }
    } catch (e) {
      setAdminMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setAdminBusy(false);
    }
  };

  const runAgent = useCallback(
    async (opts: {
      messages: ChatMsg[];
      approved?: boolean;
      pending?: ApprovalPayload;
    }) => {
      setBusy(true);
      setAssistantBuf("");
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            messages: opts.messages,
            approved: opts.approved,
            pending: opts.pending
              ? {
                  tool_call_id: opts.pending.tool_call_id,
                  name: opts.pending.name,
                  args: opts.pending.args,
                }
              : undefined,
            memory_id: memoryId || opts.pending?.memory_id || undefined,
          }),
        });

        if (!res.ok || !res.body) {
          const t = await res.text();
          let msg = t || res.statusText;
          try {
            const j = JSON.parse(t);
            if (j.error) msg = j.error;
          } catch {
            /* keep */
          }
          pushLog("error", msg);
          if (res.status === 403) void refreshStatus();
          setBusy(false);
          return;
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buffer = "";
        let fullAssistant = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += dec.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;
            let ev: {
              type: string;
              text?: string;
              level?: TermLine["level"];
              id?: string;
              tool_call_id?: string;
              name?: string;
              args?: Record<string, unknown>;
              reason?: string;
              memory_id?: string;
            };
            try {
              ev = JSON.parse(raw);
            } catch {
              continue;
            }

            if (ev.type === "token" && ev.text) {
              fullAssistant += ev.text;
              setAssistantBuf(fullAssistant);
            } else if (ev.type === "log") {
              pushLog(ev.level || "info", ev.text || "");
              if (
                ev.level === "success" &&
                ev.text &&
                ev.text.includes('"github"')
              ) {
                setRefreshKey((k) => k + 1);
              }
            } else if (ev.type === "memory" && ev.id) {
              setMemoryId(ev.id);
              pushLog("mem", `Session memory: ${ev.id}`);
            } else if (ev.type === "approval") {
              setPending({
                tool_call_id: ev.tool_call_id || "",
                name: ev.name || "",
                args: ev.args || {},
                reason: ev.reason || "Approval required",
                memory_id: ev.memory_id,
              });
              pushLog("approval", `Waiting approval: ${ev.name}`);
            } else if (ev.type === "error") {
              pushLog("error", ev.text || "Error");
            } else if (ev.type === "done") {
              if (ev.memory_id) setMemoryId(ev.memory_id);
            }
          }
        }

        if (fullAssistant.trim()) {
          const next = [
            ...opts.messages,
            { role: "assistant" as const, content: fullAssistant.trim() },
          ];
          historyRef.current = next;
          setMessages(next);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          pushLog("error", e instanceof Error ? e.message : String(e));
        }
      } finally {
        setBusy(false);
        setAssistantBuf("");
      }
    },
    [memoryId, pushLog, refreshStatus]
  );

  const onSend = async () => {
    const text = input.trim();
    if (!text || busy) return;
    if (agentOn === false) {
      pushLog("error", "Agent is OFF. Turn ON from Admin controls first.");
      return;
    }
    setInput("");
    const next = [
      ...historyRef.current,
      { role: "user" as const, content: text },
    ];
    historyRef.current = next;
    setMessages(next);
    pushLog("info", `User: ${text.slice(0, 120)}`);
    await runAgent({ messages: next });
  };

  const onApprove = async () => {
    if (!pending) return;
    const p = pending;
    setPending(null);
    pushLog("success", `Approved: ${p.name}`);
    if (p.name === "write_file" && typeof p.args.content === "string") {
      setDiffPath(String(p.args.path || ""));
      setDiffAfter(String(p.args.content));
    }
    await runAgent({
      messages: historyRef.current,
      approved: true,
      pending: p,
    });
  };

  const onReject = async () => {
    if (!pending) return;
    const p = pending;
    setPending(null);
    pushLog("info", `Rejected: ${p.name}`);
    await runAgent({
      messages: historyRef.current,
      approved: false,
      pending: p,
    });
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-3 pb-8 text-slate-100 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/80">
            PASIYA MAX · Agent V3
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Agent Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gemini free · GitHub · Supabase memory · Admin ON/OFF
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {agentOn === true && (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
              ON
            </span>
          )}
          {agentOn === false && (
            <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-rose-300">
              OFF
            </span>
          )}
          {memoryId && (
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-[10px] text-violet-300">
              mem {memoryId.slice(0, 8)}
            </span>
          )}
        </div>
      </header>

      {/* Admin ON/OFF */}
      <div className="rounded-2xl border border-white/10 bg-[#0a0f1a] p-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Admin controls (you only)
        </p>
        <p className="mt-1 text-sm text-slate-400">
          OFF කළාම visitors Gemini use කරන්න බැහැ — free quota ඉතිරි වෙනවා. ON
          කළාම විතරක් agent වැඩ කරනවා.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="Admin secret (Vercel AGENT_ADMIN_SECRET)"
            className="min-h-11 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none ring-cyan-500/40 placeholder:text-slate-600 focus:ring-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={adminBusy || !adminSecret.trim()}
              onClick={() => void toggleAgent(true)}
              className="min-h-11 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-black disabled:opacity-40 hover:bg-emerald-400"
            >
              Turn ON
            </button>
            <button
              type="button"
              disabled={adminBusy || !adminSecret.trim()}
              onClick={() => void toggleAgent(false)}
              className="min-h-11 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 text-sm font-semibold text-rose-200 disabled:opacity-40 hover:bg-rose-500/25"
            >
              Turn OFF
            </button>
          </div>
        </div>
        {adminMsg && (
          <p className="mt-2 text-xs text-slate-400">{adminMsg}</p>
        )}
      </div>

      {agentOn === false && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Agent is <strong>OFF</strong>. Chat / tools paused — no Gemini
          usage. Turn ON above when you need it.
        </div>
      )}

      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-[#0a0f1a]">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !assistantBuf && (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                <p className="font-medium text-slate-300">
                  Try: &quot;List files in the repo&quot;
                </p>
                <p className="mt-2">
                  Agent must be ON (admin) before send works.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[95%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-cyan-500/20 text-cyan-50"
                    : "bg-white/5 text-slate-200"
                }`}
              >
                <p className="mb-0.5 text-[9px] uppercase tracking-wider opacity-50">
                  {m.role}
                </p>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {assistantBuf && (
              <div className="max-w-[95%] rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-slate-200">
                <p className="mb-0.5 text-[9px] uppercase tracking-wider opacity-50">
                  assistant
                </p>
                <div className="whitespace-pre-wrap">{assistantBuf}</div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void onSend();
                  }
                }}
                disabled={busy || agentOn === false}
                placeholder={
                  agentOn === false
                    ? "Agent OFF — turn ON first…"
                    : "Message the agent…"
                }
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-cyan-500/40 placeholder:text-slate-600 focus:ring-2 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => void onSend()}
                disabled={busy || !input.trim() || agentOn === false}
                className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-40 hover:bg-cyan-400"
              >
                {busy ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-56">
            <FileExplorer
              refreshKey={refreshKey}
              onSelect={(path, content) => {
                setDiffPath(path);
                if (content) setDiffAfter(content);
              }}
            />
          </div>
          <div className="h-40">
            <DiffViewer path={diffPath} after={diffAfter} />
          </div>
        </div>
      </div>

      <div className="h-52">
        <AgentTerminal lines={lines} />
      </div>

      <ApprovalGate
        pending={pending}
        onApprove={() => void onApprove()}
        onReject={() => void onReject()}
      />
    </div>
  );
}
