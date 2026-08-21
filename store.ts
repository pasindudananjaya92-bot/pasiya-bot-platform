/** Client-side persistence helpers (works offline; syncs to Supabase when configured) */

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export type FinanceTx = {
  id: string;
  type: "income" | "expense";
  amount: number;
  label: string;
  at: number;
};

export type TeamMember = {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited";
};

export type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
};

export type StorageFile = {
  id: string;
  name: string;
  size: number;
  at: number;
  content?: string;
};

export type LoginEvent = {
  id: string;
  at: number;
  ip: string;
  device: string;
  ok: boolean;
};

export type MarketApp = {
  id: string;
  name: string;
  desc: string;
  installed: boolean;
};
