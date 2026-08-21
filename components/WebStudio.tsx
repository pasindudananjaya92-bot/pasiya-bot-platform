"use client";

import { useMemo, useState } from "react";

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0b1220;
      color: #e8f4ff;
      display: grid;
      place-items: center;
      min-height: 100vh;
      margin: 0;
    }
    h1 { color: #00e5ff; }
    button {
      background: #00e5ff;
      border: 0;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div>
    <h1>PASiYA Web Studio</h1>
    <p>Edit code on the left — preview updates live.</p>
    <button onclick="alert('Hello from Web Studio')">Click me</button>
  </div>
</body>
</html>`;

export function WebStudio() {
  const [code, setCode] = useState(DEFAULT_HTML);
  const srcDoc = useMemo(() => code, [code]);

  function download() {
    const blob = new Blob([code], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pasiya-studio.html";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-accent">✨ Web Studio</h1>
          <p className="text-[11px] text-white/45">
            Live HTML preview · edit → see result · download file
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setCode(DEFAULT_HTML)}
            className="rounded-lg border border-border px-2 py-1"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-lg bg-accent text-black font-semibold px-3 py-1"
          >
            Download HTML
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-[420px]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[320px] lg:min-h-[480px] rounded-xl border border-border bg-[#0a1220] p-3 text-xs font-mono text-white/90 outline-none focus:border-accent/40"
        />
        <div className="rounded-xl border border-border overflow-hidden bg-white min-h-[320px] lg:min-h-[480px]">
          <iframe title="preview" srcDoc={srcDoc} className="w-full h-full min-h-[320px] lg:min-h-[480px]" sandbox="allow-scripts allow-forms allow-modals" />
        </div>
      </div>
    </div>
  );
}
