"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { getSupabase, PROFILE_SELECT, type Profile } from "@/lib/supabase";

type SocialKey =
  | "instagram"
  | "facebook"
  | "youtube"
  | "whatsapp"
  | "x"
  | "bluesky"
  | "pinterest"
  | "reddit"
  | "blog1"
  | "blog2"
  | "substack"
  | "website";

const SOCIAL: {
  key: SocialKey;
  label: string;
  className: string;
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    className: "bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30",
  },
  {
    key: "facebook",
    label: "Facebook",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30",
  },
  {
    key: "youtube",
    label: "YouTube",
    className: "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    className: "bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/30",
  },
  {
    key: "x",
    label: "X",
    className: "bg-zinc-500/20 text-zinc-200 border-zinc-400/40 hover:bg-zinc-500/30",
  },
  {
    key: "bluesky",
    label: "BlueSky",
    className: "bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30",
  },
  {
    key: "pinterest",
    label: "Pinterest",
    className: "bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600/30",
  },
  {
    key: "reddit",
    label: "Reddit",
    className: "bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30",
  },
  {
    key: "blog1",
    label: "Blog 1",
    className: "bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/30",
  },
  {
    key: "blog2",
    label: "Blog 2",
    className: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30",
  },
  {
    key: "substack",
    label: "Substack",
    className: "bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30",
  },
  {
    key: "website",
    label: "Website",
    className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30",
  },
];

function normalizeHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function SocialLinks({ profile }: { profile: Profile }) {
  const links = SOCIAL.map((s) => {
    const raw = profile[s.key];
    if (!raw || !String(raw).trim()) return null;
    return {
      ...s,
      href: normalizeHref(String(raw)),
    };
  }).filter(Boolean) as { key: SocialKey; label: string; className: string; href: string }[];

  if (links.length === 0) {
    return (
      <p className="text-[11px] text-white/35 mt-3">No social links</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${l.className}`}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

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
        .select(PROFILE_SELECT)
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
                  <SocialLinks profile={p} />
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
