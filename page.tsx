"use client";
import { useEffect, useState } from "react";
import { Workflow, loadJSON, saveJSON } from "@/lib/store";

export default function AutomationPage() {
  const [flows, setFlows] = useState<Workflow[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("new_user");
  const [action, setAction] = useState("send_email");

  useEffect(() => { setFlows(loadJSON("pasiya_workflows", [])); }, []);

  function add() {
    if (!name.trim()) return;
    const next = [{ id: crypto.randomUUID(), name, trigger, action, enabled: true }, ...flows];
    setFlows(next); saveJSON("pasiya_workflows", next);
    setName("");
  }

  function toggle(id: string) {
    const next = flows.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    setFlows(next); saveJSON("pasiya_workflows", next);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold text-white">Automation Lab</h1>
      <p className="text-sm text-muted">
        Lightweight workflow builder. For production graphs use{" "}
        <a className="text-accent" href="https://pasiyamax.app.n8n.cloud" target="_blank" rel="noreferrer">n8n Cloud</a>.
      </p>
      <div className="card space-y-2">
        <input className="input" placeholder="Workflow name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid sm:grid-cols-2 gap-2">
          <select className="input" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
            <option value="new_user">If new user</option>
            <option value="payment">If payment received</option>
            <option value="form">If form submitted</option>
            <option value="schedule">On schedule</option>
          </select>
          <select className="input" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="send_email">Send email</option>
            <option value="webhook">Call webhook</option>
            <option value="notify">In-app notify</option>
            <option value="slack">Post to Slack</option>
          </select>
        </div>
        <button className="btn-solid" onClick={add}>Create workflow</button>
      </div>
      <ul className="space-y-2">
        {flows.map((f) => (
          <li key={f.id} className="card flex flex-wrap items-center justify-between gap-2 text-sm">
            <div>
              <div className="font-semibold text-white">{f.name}</div>
              <div className="text-muted text-xs">IF {f.trigger} → THEN {f.action}</div>
            </div>
            <button className="btn" onClick={() => toggle(f.id)}>{f.enabled ? "Enabled" : "Disabled"}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
