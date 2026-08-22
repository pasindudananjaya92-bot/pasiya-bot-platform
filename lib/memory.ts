import { getSupabaseServer } from "./supabase";

export type MemoryRow = {
  id: string;
  task: string;
  steps: unknown[];
  status: string;
  conversation: unknown[];
  created_at: string;
};

export type CachedFile = {
  id: string;
  path: string;
  content: string | null;
  repo_name: string;
  updated_at: string;
};

const REPO =
  process.env.GITHUB_REPO ||
  process.env.NEXT_PUBLIC_GITHUB_REPO ||
  "pasiya-bot-platform";

export async function saveMemory(input: {
  task: string;
  steps?: unknown[];
  status?: string;
  conversation?: unknown[];
}): Promise<MemoryRow | null> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("agent_memory")
      .insert({
        task: input.task,
        steps: input.steps ?? [],
        status: input.status ?? "running",
        conversation: input.conversation ?? [],
      })
      .select()
      .single();
    if (error) {
      console.error("[memory] save", error.message);
      return null;
    }
    return data as MemoryRow;
  } catch (e) {
    console.error("[memory] save", e);
    return null;
  }
}

export async function updateMemory(
  id: string,
  patch: {
    steps?: unknown[];
    status?: string;
    conversation?: unknown[];
  }
): Promise<void> {
  try {
    const sb = getSupabaseServer();
    const { error } = await sb.from("agent_memory").update(patch).eq("id", id);
    if (error) console.error("[memory] update", error.message);
  } catch (e) {
    console.error("[memory] update", e);
  }
}

export async function recentMemory(limit = 8): Promise<MemoryRow[]> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("agent_memory")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[memory] recent", error.message);
      return [];
    }
    return (data ?? []) as MemoryRow[];
  } catch {
    return [];
  }
}

/** Upsert file content into agent_files + Storage bucket project-files */
export async function cacheFile(
  path: string,
  content: string,
  repoName = REPO
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sb = getSupabaseServer();
    const { error: tableErr } = await sb.from("agent_files").upsert(
      {
        path,
        content,
        repo_name: repoName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "repo_name,path" }
    );
    if (tableErr) {
      console.error("[memory] cache table", tableErr.message);
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const storagePath = `${repoName}/${path}`;
    const { error: storErr } = await sb.storage
      .from("project-files")
      .upload(storagePath, blob, { upsert: true, contentType: "text/plain" });
    if (storErr) {
      console.error("[memory] cache storage", storErr.message);
      return { ok: !tableErr, error: storErr.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function listCachedFiles(
  repoName = REPO
): Promise<CachedFile[]> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("agent_files")
      .select("*")
      .eq("repo_name", repoName)
      .order("path");
    if (error) {
      console.error("[memory] list cache", error.message);
      return [];
    }
    return (data ?? []) as CachedFile[];
  } catch {
    return [];
  }
}

export async function readCachedFile(
  path: string,
  repoName = REPO
): Promise<string | null> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("agent_files")
      .select("content")
      .eq("repo_name", repoName)
      .eq("path", path)
      .maybeSingle();
    if (error || !data) return null;
    return (data as { content: string | null }).content;
  } catch {
    return null;
  }
}
