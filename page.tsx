"use client";
import { useEffect, useState } from "react";
import { TeamMember, loadJSON, saveJSON } from "@/lib/store";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState("");
  const [chat, setChat] = useState<{ who: string; text: string; at: number }[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMembers(loadJSON("pasiya_team", [{ id: "1", email: "you@pasiya.local", role: "owner", status: "active" }]));
    setChat(loadJSON("pasiya_team_chat", []));
  }, []);

  function invite() {
    if (!email.includes("@")) return;
    const next = [{ id: crypto.randomUUID(), email, role: "member" as const, status: "invited" as const }, ...members];
    setMembers(next); saveJSON("pasiya_team", next); setEmail("");
  }

  function send() {
    if (!msg.trim()) return;
    const next = [...chat, { who: "You", text: msg.trim(), at: Date.now() }];
    setChat(next); saveJSON("pasiya_team_chat", next); setMsg("");
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4 max-w-5xl">
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-white">Team & Collaboration</h1>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="email@team.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn-solid" onClick={invite}>Invite</button>
        </div>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="card flex justify-between text-sm">
              <span>{m.email}</span>
              <span className="text-muted">{m.role} · {m.status}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <h2 className="font-semibold text-white">Workspace chat</h2>
        <div className="card h-64 overflow-y-auto text-sm space-y-2">
          {chat.length === 0 && <div className="text-muted">No messages</div>}
          {chat.map((c, i) => (
            <div key={i}><b className="text-accent">{c.who}:</b> {c.text}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
