"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { getSupabase, type Profile } from "@/lib/supabase";

export function SearchBar() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Profile[] | null>(null);

  async function runSearch(term: string) {
    const query = term.trim();
    if (!query) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const supabase = getSupabase();
      const { data, error: sbError } = await supabase
        .from("profiles")
        .select("id, username, created_at")
        .ilike("username", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(24);

      if (sbError) {
        setError(sbError.message);
        setResults([]);
        return;
      }

      setResults((data as Profile[]) || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Search failed";
      setError(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void runSearch(q);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void runSearch(q);
    }
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search username…"
          className="flex-1 rounded-xl bg-bg border border-border px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-accent/50"
          aria-label="Search profiles by username"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent text-black font-semibold px-4 py-2.5 text-sm disabled:opacity-60 shrink-0"
        >
          {loading ? "…" : "Search"}
        </button>
      </form>

      {loading && (
        <p className="text-sm text-white/50 animate-pulse">Searching profiles…</p>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {results && !loading && (
        <>
          <p className="text-xs text-white/40">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          {results.length === 0 ? (
            <p className="text-sm text-white/50">No profiles matched.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-border bg-panel p-4 hover:border-accent/35 transition"
                >
                  <div className="text-accent font-semibold text-sm truncate">
                    {p.username || "(no username)"}
                  </div>
                  <div className="text-[11px] text-white/40 mt-2">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "—"}
                  </div>
                  <div className="text-[10px] text-white/25 mt-1 truncate font-mono">
                    {p.id}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
