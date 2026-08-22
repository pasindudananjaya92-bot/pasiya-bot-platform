"use client";

export type ApprovalPayload = {
  tool_call_id: string;
  name: string;
  args: Record<string, unknown>;
  reason: string;
  memory_id?: string;
};

export default function ApprovalGate({
  pending,
  onApprove,
  onReject,
}: {
  pending: ApprovalPayload | null;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!pending) return null;

  const preview = JSON.stringify(pending.args, null, 2);
  const truncated =
    preview.length > 1200 ? preview.slice(0, 1200) + "\n…" : preview;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#0d121c] p-5 shadow-2xl">
        <p className="text-[10px] uppercase tracking-wider text-amber-400/80">
          Approval required
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">
          Run tool:{" "}
          <span className="font-mono text-cyan-300">{pending.name}</span>
        </h3>
        <p className="mt-2 text-sm text-slate-400">{pending.reason}</p>
        <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] text-slate-300">
          {truncated}
        </pre>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onReject}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 hover:bg-white/5"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 rounded-xl bg-cyan-500 py-2.5 text-sm font-medium text-black hover:bg-cyan-400"
          >
            Approve &amp; run
          </button>
        </div>
      </div>
    </div>
  );
}
