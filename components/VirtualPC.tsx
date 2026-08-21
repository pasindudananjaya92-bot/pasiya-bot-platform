"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Win = {
  id: string;
  title: string;
  url?: string;
  body?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

const DESKTOP_APPS: {
  id: string;
  title: string;
  icon: string;
  url?: string;
  body?: string;
}[] = [
  { id: "files", title: "Files", icon: "📁", body: "Virtual Files\n\n- Documents/\n- Projects/\n- Downloads/\n\n(Full cloud FS in a later step)" },
  { id: "browser", title: "Browser", icon: "🌐", url: "https://example.com" },
  { id: "github", title: "GitHub", icon: "🐙", url: "https://github.com/pasindudananjaya92-bot/pasiya-bot-platform" },
  { id: "vscode", title: "VS Code", icon: "💙", url: "https://vscode.dev" },
  { id: "n8n", title: "n8n", icon: "🔗", url: "https://app.n8n.cloud" },
  { id: "supabase", title: "Supabase", icon: "⚡", url: "https://supabase.com/dashboard" },
  { id: "mongo", title: "MongoDB", icon: "🍃", url: "https://cloud.mongodb.com" },
  { id: "vercel", title: "Vercel", icon: "▲", url: "https://vercel.com/dashboard" },
  { id: "replit", title: "Replit", icon: "🌀", url: "https://replit.com" },
  { id: "youtube", title: "YouTube", icon: "▶️", url: "https://youtube.com/@pasya" },
  { id: "notes", title: "Notepad", icon: "📝", body: "Type notes here…\nSaved only in this window until refresh." },
  { id: "settings", title: "PC Settings", icon: "⚙", body: "Display · Sound · Network · Privacy\n(Web OS settings panel)" },
];

const KEY_ROWS = [
  ["Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Back"],
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
  ["Ctrl", "Alt", "Space", "Alt", "Ctrl"],
];

export function VirtualPC() {
  const deskRef = useRef<HTMLDivElement>(null);
  const [wins, setWins] = useState<Win[]>([]);
  const [zTop, setZTop] = useState(10);
  const [kbd, setKbd] = useState(true);
  const [pad, setPad] = useState(true);
  const [cursor, setCursor] = useState({ x: 120, y: 120 });
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [clock, setClock] = useState("");
  const [toast, setToast] = useState("");
  const activeId = wins.length ? wins.reduce((a, b) => (a.z >= b.z ? a : b)).id : null;

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2000);
  };

  const focus = (id: string) => {
    setZTop((z) => {
      const nz = z + 1;
      setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: nz } : w)));
      return nz;
    });
  };

  const openApp = (app: (typeof DESKTOP_APPS)[0]) => {
    setMenu(null);
    setWins((ws) => {
      const exist = ws.find((w) => w.id === app.id);
      if (exist) {
        focus(app.id);
        return ws;
      }
      const nz = zTop + 1;
      setZTop(nz);
      return [
        ...ws,
        {
          id: app.id,
          title: app.title,
          url: app.url,
          body: app.body,
          x: 24 + (ws.length % 4) * 16,
          y: 24 + (ws.length % 4) * 16,
          w: 320,
          h: 240,
          z: nz,
        },
      ];
    });
  };

  const closeWin = (id: string) => setWins((ws) => ws.filter((w) => w.id !== id));

  const moveCursor = (dx: number, dy: number) => {
    const box = deskRef.current?.getBoundingClientRect();
    const maxX = box ? box.width - 12 : 400;
    const maxY = box ? box.height - 12 : 300;
    setCursor((c) => ({
      x: Math.max(0, Math.min(maxX, c.x + dx)),
      y: Math.max(0, Math.min(maxY, c.y + dy)),
    }));
  };

  const padRef = useRef<{ x: number; y: number } | null>(null);

  const onPadStart = (e: React.TouchEvent | React.MouseEvent) => {
    const p = "touches" in e ? e.touches[0] : e;
    padRef.current = { x: p.clientX, y: p.clientY };
  };
  const onPadMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!padRef.current) return;
    const p = "touches" in e ? e.touches[0] : e;
    if (!p) return;
    const dx = p.clientX - padRef.current.x;
    const dy = p.clientY - padRef.current.y;
    padRef.current = { x: p.clientX, y: p.clientY };
    moveCursor(dx * 1.2, dy * 1.2);
  };
  const onPadEnd = () => {
    padRef.current = null;
  };

  const leftClick = () => {
    setMenu(null);
    const el = deskRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const target = document.elementFromPoint(rect.left + cursor.x, rect.top + cursor.y);
    if (target && target instanceof HTMLElement) {
      target.click();
    }
  };

  const rightClick = () => {
    setMenu({ x: cursor.x, y: cursor.y });
  };

  const typeKey = (key: string) => {
    if (key === "Space") key = " ";
    if (key === "Back") {
      showToast("Backspace");
      return;
    }
    if (key === "Enter") {
      showToast("Enter");
      return;
    }
    if (["Shift", "Ctrl", "Alt", "Tab", "Caps", "Esc"].includes(key)) {
      showToast(key);
      return;
    }
    showToast(key);
  };

  const onDeskContext = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = deskRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="flex flex-col gap-2 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-accent">💻 Virtual PC</h1>
          <p className="text-[11px] text-white/45">
            Desktop · windows · trackpad · keyboard (Web OS mode)
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className="rounded-lg border border-border px-2 py-1"
            onClick={() => setKbd((v) => !v)}
          >
            {kbd ? "Hide KB" : "Keyboard"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-2 py-1"
            onClick={() => setPad((v) => !v)}
          >
            {pad ? "Hide Pad" : "Trackpad"}
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div
        ref={deskRef}
        onContextMenu={onDeskContext}
        className="relative rounded-2xl border border-border overflow-hidden select-none"
        style={{
          height: "min(52vh, 420px)",
          background:
            "radial-gradient(ellipse at 30% 20%, #1a3a5c 0%, #0a1220 45%, #070b14 100%)",
        }}
      >
        {/* icons */}
        <div className="absolute inset-0 p-3 grid grid-cols-4 sm:grid-cols-5 content-start gap-2 z-0">
          {DESKTOP_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              onDoubleClick={() => openApp(app)}
              onClick={() => openApp(app)}
              className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/10 text-white/90"
            >
              <span className="text-2xl">{app.icon}</span>
              <span className="text-[10px] text-center leading-tight">{app.title}</span>
            </button>
          ))}
        </div>

        {/* windows */}
        {wins.map((w) => (
          <div
            key={w.id}
            className="absolute flex flex-col rounded-lg border border-cyan-500/30 bg-[#0d1526] shadow-2xl overflow-hidden"
            style={{
              left: w.x,
              top: w.y,
              width: Math.min(w.w, 360),
              height: Math.min(w.h, 280),
              zIndex: w.z,
            }}
            onMouseDown={() => focus(w.id)}
          >
            <div className="h-8 shrink-0 flex items-center gap-2 px-2 bg-[#12203a] border-b border-border">
              <span className="text-[11px] flex-1 truncate">{w.title}</span>
              {w.url && (
                <a
                  href={w.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  Tab
                </a>
              )}
              <button
                type="button"
                className="text-white/70 px-1"
                onClick={() => closeWin(w.id)}
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-black/40">
              {w.url ? (
                <iframe title={w.title} src={w.url} className="w-full h-full bg-white" />
              ) : (
                <textarea
                  className="w-full h-full bg-transparent text-xs p-2 text-white/80 resize-none outline-none"
                  defaultValue={w.body || ""}
                />
              )}
            </div>
          </div>
        ))}

        {/* cursor */}
        <div
          className="pointer-events-none absolute z-[100] w-3 h-3 rounded-full border-2 border-accent bg-accent/30"
          style={{ left: cursor.x, top: cursor.y, transform: "translate(-20%, -20%)" }}
        />

        {/* context menu */}
        {menu && (
          <div
            className="absolute z-[110] min-w-[140px] rounded-lg border border-border bg-[#0d1526] py-1 text-xs shadow-xl"
            style={{ left: menu.x, top: menu.y }}
          >
            {[
              { t: "Refresh", fn: () => { setMenu(null); showToast("Refreshed"); } },
              { t: "New Notepad", fn: () => openApp(DESKTOP_APPS.find((a) => a.id === "notes")!) },
              { t: "Open Files", fn: () => openApp(DESKTOP_APPS.find((a) => a.id === "files")!) },
              { t: "Close menu", fn: () => setMenu(null) },
            ].map((item) => (
              <button
                key={item.t}
                type="button"
                className="w-full text-left px-3 py-1.5 hover:bg-accent/15"
                onClick={item.fn}
              >
                {item.t}
              </button>
            ))}
          </div>
        )}

        {toast && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[120] rounded-full bg-black/70 border border-border px-3 py-1 text-[10px]">
            {toast}
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="h-10 rounded-xl border border-border bg-panel flex items-center gap-2 px-2">
        <button
          type="button"
          className="rounded-lg bg-accent/20 text-accent text-xs px-2 py-1 font-semibold"
          onClick={() => setMenu((m) => (m ? null : { x: 12, y: 12 }))}
        >
          Start
        </button>
        <div className="flex-1 flex gap-1 overflow-x-auto">
          {wins.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => focus(w.id)}
              className={[
                "text-[10px] px-2 py-1 rounded border shrink-0",
                activeId === w.id ? "border-accent text-accent" : "border-border text-white/60",
              ].join(" ")}
            >
              {w.title}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-white/50 tabular-nums">{clock}</span>
      </div>

      {/* Trackpad */}
      {pad && (
        <div className="rounded-xl border border-border bg-[#0a1220] p-2">
          <div className="text-[10px] text-white/40 mb-1 px-1">Trackpad — drag to move cursor</div>
          <div
            className="h-28 rounded-lg bg-black/40 border border-white/10 touch-none"
            onMouseDown={onPadStart}
            onMouseMove={(e) => e.buttons === 1 && onPadMove(e)}
            onMouseUp={onPadEnd}
            onMouseLeave={onPadEnd}
            onTouchStart={onPadStart}
            onTouchMove={onPadMove}
            onTouchEnd={onPadEnd}
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={leftClick}
              className="rounded-lg border border-border py-3 text-xs hover:bg-white/5"
            >
              Left click
            </button>
            <button
              type="button"
              onClick={rightClick}
              className="rounded-lg border border-border py-3 text-xs hover:bg-white/5"
            >
              Right click
            </button>
          </div>
        </div>
      )}

      {/* Keyboard */}
      {kbd && (
        <div className="rounded-xl border border-border bg-[#0a1220] p-2 space-y-1">
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-0.5 flex-wrap">
              {row.map((k, ki) => (
                <button
                  key={`${ri}-${ki}-${k}`}
                  type="button"
                  onClick={() => typeKey(k)}
                  className={[
                    "rounded-md border border-border bg-panel text-[11px] active:bg-accent/30",
                    k === "Space" ? "min-w-[42%] py-3" : "min-w-[28px] px-1.5 py-2.5",
                    ["Back", "Enter", "Shift"].includes(k) ? "min-w-[48px]" : "",
                  ].join(" ")}
                >
                  {k}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
