"use client";
import { useEffect, useMemo, useState } from "react";
import { StorageFile, loadJSON, saveJSON } from "@/lib/store";

const LIMIT = 10 * 1024 * 1024; // 10MB demo quota in browser (text)

export default function StoragePage() {
  const [files, setFiles] = useState<StorageFile[]>([]);

  useEffect(() => { setFiles(loadJSON("pasiya_cloud_files", [])); }, []);
  const used = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files]);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      const size = content.length;
      if (used + size > LIMIT) { alert("Demo quota 10MB exceeded"); return; }
      const next = [{ id: crypto.randomUUID(), name: f.name, size, at: Date.now(), content }, ...files];
      setFiles(next); saveJSON("pasiya_cloud_files", next);
    };
    reader.readAsText(f);
  }

  function download(file: StorageFile) {
    const blob = new Blob([file.content || ""], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
  }

  function remove(id: string) {
    const next = files.filter((f) => f.id !== id);
    setFiles(next); saveJSON("pasiya_cloud_files", next);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold text-white">Cloud Storage</h1>
      <p className="text-sm text-muted">Browser vault demo. Production: Supabase Storage (10GB plan per user via quotas).</p>
      <div className="card">
        <div className="text-xs text-muted mb-1">Used {(used / 1024).toFixed(1)} KB / 10 MB demo</div>
        <div className="h-2 rounded bg-bg-elev overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${Math.min(100, (used / LIMIT) * 100)}%` }} />
        </div>
      </div>
      <label className="btn cursor-pointer w-fit">
        Upload file
        <input type="file" className="hidden" onChange={onUpload} />
      </label>
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.id} className="card flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>{f.name} <span className="text-muted">({(f.size / 1024).toFixed(1)} KB)</span></span>
            <span className="flex gap-2">
              <button className="btn" onClick={() => download(f)}>Download</button>
              <button className="btn" onClick={() => remove(f.id)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
