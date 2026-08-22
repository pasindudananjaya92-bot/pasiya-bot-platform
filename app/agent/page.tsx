"use client";

import { useCallback, useRef, useState } from "react";
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
          pushLog("error", t || res.statusText);
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
              pushLog(
                "approval",
                `Waiting approval: ${ev.name}`
              );
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
    [memoryId, pushLog]
  );

  const onSend = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...historyRef.current, { role: "user" as const, content: text }];
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
            Grok-4-fast · GitHub · Supabase memory &amp; storage · Edge sandbox
          </p>
        </div>
        {memoryId && (
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-[10px] text-violet-300">
            mem {memoryId.slice(0, 8)}
          </span>
        )}
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Chat column */}
        <div className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-[#0a0f1a]">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !assistantBuf && (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                <p className="font-medium text-slate-300">
                  Try: &quot;List files in the repo&quot;
                </p>
                <p className="mt-2">
                  or &quot;Remember this task: test memory&quot; · or ask to
                  write a small file (approval required)
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
                    onSend();
                  }
                }}
                disabled={busy}
                placeholder="Message the agent…"
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-cyan-500/40 placeholder:text-slate-600 focus:ring-2"
              />
              <button
                type="button"
                onClick={onSend}
                disabled={busy || !input.trim()}
                className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black disabled:opacity-40 hover:bg-cyan-400"
              >
                {busy ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* Side panels */}
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
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}
