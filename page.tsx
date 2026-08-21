"use client";
import { useEffect, useMemo, useState } from "react";
import { FinanceTx, loadJSON, saveJSON } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function FinancePage() {
  const [txs, setTxs] = useState<FinanceTx[]>([]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");

  useEffect(() => { setTxs(loadJSON("pasiya_finance_txs", [])); }, []);
  function persist(next: FinanceTx[]) { setTxs(next); saveJSON("pasiya_finance_txs", next); }

  function add() {
    const n = parseFloat(amount);
    if (!label || !n) return;
    persist([{ id: crypto.randomUUID(), type, amount: n, label, at: Date.now() }, ...txs]);
    setLabel(""); setAmount("");
  }

  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const chart = useMemo(() => {
    const map: Record<string, { day: string; income: number; expense: number }> = {};
    txs.forEach((t) => {
      const day = new Date(t.at).toISOString().slice(5, 10);
      if (!map[day]) map[day] = { day, income: 0, expense: 0 };
      map[day][t.type] += t.amount;
    });
    return Object.values(map).slice(-12);
  }, [txs]);

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-bold text-white">Finance Center</h1>
      <p className="text-sm text-muted">Track income/expense locally. Stripe checkout → add secret key on Vercel for live payments.</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card"><div className="text-xs text-muted">Income</div><div className="text-2xl text-emerald-400 font-bold">${income.toFixed(2)}</div></div>
        <div className="card"><div className="text-xs text-muted">Expense</div><div className="text-2xl text-rose-400 font-bold">${expense.toFixed(2)}</div></div>
        <div className="card"><div className="text-xs text-muted">Net</div><div className="text-2xl text-accent font-bold">${(income - expense).toFixed(2)}</div></div>
      </div>
      <div className="card h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ background: "#0c1220", border: "1px solid #134" }} />
            <Bar dataKey="income" fill="#34d399" />
            <Bar dataKey="expense" fill="#fb7185" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2">
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input className="input flex-1 min-w-[120px]" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className="input w-28" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn-solid" onClick={add}>Add</button>
      </div>
      <ul className="space-y-2">
        {txs.slice(0, 20).map((t) => (
          <li key={t.id} className="card flex justify-between text-sm">
            <span>{t.label}</span>
            <span className={t.type === "income" ? "text-emerald-400" : "text-rose-400"}>
              {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
