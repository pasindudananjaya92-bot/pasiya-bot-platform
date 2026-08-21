"use client";

import { useEffect, useMemo, useState } from "react";

type Row = { id: string; type: "in" | "out"; label: string; amount: number };

const KEY = "pasiya_finance_rows";

export function FinanceCenter() {
  const [rows, setRows] = useState<Row[]>([]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"in" | "out">("in");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRows(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(rows));
    } catch {}
  }, [rows]);

  const income = useMemo(() => rows.filter((r) => r.type === "in").reduce((s, r) => s + r.amount, 0), [rows]);
  const expense = useMemo(() => rows.filter((r) => r.type === "out").reduce((s, r) => s + r.amount, 0), [rows]);
  const balance = income - expense;

  function add() {
    const n = Number(amount);
    if (!label.trim() || !Number.isFinite(n) || n <= 0) return;
    setRows((prev) => [
      { id: String(Date.now()), type, label: label.trim(), amount: n },
      ...prev,
    ]);
    setLabel("");
    setAmount("");
  }

  function remove(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-accent">💰 Finance Center</h1>
        <p className="text-[11px] text-white/45">Local tracker · saved on this device</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-panel p-3">
          <div className="text-[10px] text-white/40">Income</div>
          <div className="text-lg font-bold text-emerald-400">{income.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-border bg-panel p-3">
          <div className="text-[10px] text-white/40">Expense</div>
          <div className="text-lg font-bold text-rose-400">{expense.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-border bg-panel p-3">
          <div className="text-[10px] text-white/40">Balance</div>
          <div className={`text-lg font-bold ${balance >= 0 ? "text-accent" : "text-rose-400"}`}>
            {balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-3 space-y-2">
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setType("in")}
            className={`rounded-lg px-3 py-1 ${type === "in" ? "bg-emerald-500/20 text-emerald-300" : "border border-border"}`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType("out")}
            className={`rounded-lg px-3 py-1 ${type === "out" ? "bg-rose-500/20 text-rose-300" : "border border-border"}`}
          >
            Expense
          </button>
        </div>
        <input
          className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="w-full rounded-lg bg-bg border border-border px-3 py-2 text-sm"
          placeholder="Amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="button" onClick={add} className="rounded-lg bg-accent text-black font-semibold px-4 py-2 text-sm">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {rows.length === 0 && <li className="text-xs text-white/40">No rows yet</li>}
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-border bg-panel px-3 py-2 text-sm"
          >
            <div>
              <span className={r.type === "in" ? "text-emerald-400" : "text-rose-400"}>
                {r.type === "in" ? "+" : "-"}
                {r.amount.toFixed(2)}
              </span>
              <span className="text-white/70 ml-2">{r.label}</span>
            </div>
            <button type="button" onClick={() => remove(r.id)} className="text-[10px] text-white/40 hover:text-rose-300">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
