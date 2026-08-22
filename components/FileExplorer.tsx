"use client";

import { useCallback, useEffect, useState } from "react";

type FileEntry = {
  path: string;
  type: "file" | "dir";
  size?: number;
  cached?: boolean;
  source?: string;
};

export default function FileExplorer({
  onSelect,
  refreshKey,
}: {
  onSelect?: (path: string, content?: string) => void;
  refreshKey?: number;
}) {
  const [path, setPath] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cacheCount, setCacheCount] = useState(0);

  const load = useCallback(async (p: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/agent/files?path=${encodeURIComponent(p)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setFiles(data.files || []);
      setCacheCount(data.cache_count ?? 0);
      setPath(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load("");
  }, [load, refreshKey]);

  const open = async (f: FileEntry) => {
    if (f.type === "dir") {
      load(f.path);
      return;
    }
    try {
      const res = await fetch(
        `/api/agent/files?mode=read&path=${encodeURIComponent(f.path)}`
      );
      const data = await res.json();
      if (res.ok) onSelect?.(f.path, data.content);
      else onSelect?.(f.path);
    } catch {
      onSelect?.(f.path);
    }
  };

  const parent = path.includes("/")
    ? path.split("/").slice(0, -1).join("/")
    : "";

  return (
    <div className="flex h-full min-h-[160px] flex-col rounded-xl border border-white/10 bg-[#0a0f1a]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">
        <span>Files</span>
        {cacheCount > 0 && (
          <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-violet-300">
            {cacheCount} cached
          </span>
        )}
        <button
          type="button"
          onClick={() => load(path)}
          className="ml-auto text-cyan-400 hover:text-cyan-300"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-xs">
        {path && (
          <button
            type="button"
            onClick={() => load(parent)}
            className="mb-1 block w-full rounded px-2 py-1.5 text-left text-slate-400 hover:bg-white/5"
          >
            ← ..
          </button>
        )}
        {loading && <p className="px-2 text-slate-500">Loading…</p>}
        {error && <p className="px-2 text-rose-400">{error}</p>}
        {!loading &&
          files.map((f) => (
            <button
              key={f.path}
              type="button"
              onClick={() => open(f)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5"
            >
              <span className="text-slate-500">
                {f.type === "dir" ? "📁" : "📄"}
              </span>
              <span className="truncate text-slate-200">
                {f.path.split("/").pop()}
              </span>
              {f.cached && (
                <span className="ml-auto shrink-0 text-[9px] text-violet-400">
                  cache
                </span>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
