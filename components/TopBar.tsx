"use client";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="h-14 shrink-0 border-b border-border bg-panel/90 backdrop-blur flex items-center gap-3 px-3 md:px-5">
      <button
        type="button"
        onClick={onMenu}
        className="md:hidden rounded-lg border border-border px-2.5 py-1.5 text-white/80"
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="hidden sm:block text-sm text-white/50">PASiYA MAX // CMD</div>

      <div className="flex-1 max-w-md mx-auto">
        <input
          type="search"
          placeholder="Search pages, tools…"
          className="w-full rounded-xl bg-bg border border-border px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50"
        />
      </div>

      <button
        type="button"
        className="rounded-lg border border-border px-2.5 py-1.5 text-sm text-white/70"
        title="Notifications"
      >
        🔔
      </button>
      <div
        className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs text-accent font-bold"
        title="Profile"
      >
        P
      </div>
    </header>
  );
}
