"use client";

export default function DiffViewer({
  path,
  before,
  after,
}: {
  path?: string;
  before?: string;
  after?: string;
}) {
  if (!path && !after) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-white/10 bg-[#0a0f1a] text-xs text-slate-500">
        Select a file or wait for agent writes to preview diff
      </div>
    );
  }

  const a = (before || "").split("\n");
  const b = (after || "").split("\n");
  const max = Math.max(a.length, b.length);
  const rows: { type: "same" | "add" | "del"; text: string; n: number }[] = [];

  for (let i = 0; i < max; i++) {
    const left = a[i];
    const right = b[i];
    if (left === right) {
      if (right !== undefined)
        rows.push({ type: "same", text: right, n: i + 1 });
    } else {
      if (left !== undefined)
        rows.push({ type: "del", text: left, n: i + 1 });
      if (right !== undefined)
        rows.push({ type: "add", text: right, n: i + 1 });
    }
  }

  return (
    <div className="flex h-full min-h-[120px] flex-col rounded-xl border border-white/10 bg-[#070b14] font-mono text-[11px]">
      <div className="border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">
        Diff {path ? `· ${path}` : ""}
      </div>
      <div className="flex-1 overflow-auto p-2">
        {rows.slice(0, 400).map((r, i) => (
          <div
            key={i}
            className={
              r.type === "add"
                ? "bg-emerald-500/10 text-emerald-300"
                : r.type === "del"
                  ? "bg-rose-500/10 text-rose-300"
                  : "text-slate-400"
            }
          >
            <span className="inline-block w-8 select-none text-slate-600">
              {r.n}
            </span>
            <span className="select-none pr-2 opacity-50">
              {r.type === "add" ? "+" : r.type === "del" ? "−" : " "}
            </span>
            <span className="whitespace-pre-wrap break-all">{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
