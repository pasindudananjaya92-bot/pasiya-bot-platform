"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
type Msg = { role: "user" | "bot"; text: string };
export function ChatBubble() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Hi! Ask about PASIYA MAX services, hosting, or the platform. How can I help?", }]);
  const endRef = useRef<HTMLDivElement>(null);
  if (pathname?.startsWith("/agent")) return null;
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);
  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput(""); setMsgs((m) => [...m, { role: "user", text }]); setBusy(true);
    try {
      const res = await fetch("/api/chat-bubble", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }), });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMsgs((m) => [...m, { role: "bot", text: data.error || "Chat is offline. Admin: set N8N_CHAT_WEBHOOK on Vercel.", }, ]); }
      else { setMsgs((m) => [...m, { role: "bot", text: String(data.reply || "(empty response)").slice(0, 4000), }, ]); }
    } catch (e) { setMsgs((m) => [...m, { role: "bot", text: "Network error. Try again. " + String(e) }, ]); }
    finally { setBusy(false); }
  }
  return ( <> <button type="button" aria-label="Open chat" onClick={() => setOpen((v) =>!v)} className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-2xl text-black shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400" > {open? "×" : "💬"} </button> {open && ( <div className="fixed bottom-24 right-5 z-[90] flex h-[min(420px,70vh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border-white/15 bg-[#0a0f1a] shadow-2xl"> <div className="flex items-center justify-between border-b border-white/10 bg-cyan-500/10 px-4 py-3"> <div> <p className="text-sm font-semibold text-white">PASIYA Chat</p> <p className="text-[10px] text-slate-400">Support · n8n / Make</p> </div> <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10" > × </button> </div> <div className="flex-1 space-y-2 overflow-y-auto p-3"> {msgs.map((m, i) => ( <div key={i} className={ m.role === "user"? "ml-auto max-w-[90%] rounded-xl bg-cyan-500/20 px-3 py-2 text-sm text-cyan-50" : "max-w-[90%] rounded-xl bg-white/5 px-3 py-2 text-sm text-white/90" } > {m.text} </div> ))} <div ref={endRef} /> </div> <div className="flex gap-2 border-t border-white/10 p-3"> <input className="min-h-10 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/40" placeholder="Type a message…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void send()} disabled={busy} /> <button type="button" onClick={() => void send()} disabled={busy ||!input.trim()} className="rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-black disabled:opacity-40" > {busy? "…" : "Send"} </button> </div> </div> )} </> );
} 
