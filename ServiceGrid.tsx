"use client";

type Item = { name: string; href: string; desc?: string; tag?: string };

export function ServiceGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <a
          key={it.name}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className="card hover:border-accent/40 transition group"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-white group-hover:text-accent">{it.name}</div>
              {it.desc && <p className="text-xs text-muted mt-1">{it.desc}</p>}
            </div>
            {it.tag && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-accent/30 text-accent">
                {it.tag}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
