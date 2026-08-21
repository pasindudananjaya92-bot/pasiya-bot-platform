"use client";
import { useState } from "react";

export default function WebStudioPage() {
  const [html, setHtml] = useState(
    `<!DOCTYPE html>\n<html><body style="font-family:sans-serif;background:#0b1220;color:#fff;padding:2rem">\n  <h1>PASiYA Web Studio</h1>\n  <p>Edit HTML on the left · preview on the right.</p>\n</body></html>`
  );
  return (
    <div className="space-y-3 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-xl font-bold text-white">Web Studio</h1>
        <p className="text-xs text-muted">Lightweight site builder · export HTML</p>
      </div>
      <div className="grid md:grid-cols-2 gap-3 flex-1 min-h-0">
        <textarea className="input font-mono text-xs h-full min-h-[320px] resize-none" value={html} onChange={(e) => setHtml(e.target.value)} />
        <iframe title="preview" className="w-full h-full min-h-[320px] rounded-xl border border-line bg-white" srcDoc={html} />
      </div>
      <button className="btn w-fit" onClick={() => {
        const blob = new Blob([html], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "pasiya-site.html";
        a.click();
      }}>Download HTML</button>
    </div>
  );
}
