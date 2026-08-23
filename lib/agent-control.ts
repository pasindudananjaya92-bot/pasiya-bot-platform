import { getSupabaseServer } from "./supabase";

/** Read agent ON/OFF from Supabase (single row id=1). Default OFF if missing. */
export async function isAgentEnabled(): Promise<boolean> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("agent_control")
      .select("enabled")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return false;
    return !!(data as { enabled: boolean }).enabled;
  } catch {
    return false;
  }
}

export async function setAgentEnabled(enabled: boolean): Promise<{
  ok: boolean;
  enabled?: boolean;
  error?: string;
}> {
  try {
    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from("agent_control")
      .upsert({
        id: 1,
        enabled,
        updated_at: new Date().toISOString(),
      })
      .select("enabled")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, enabled: !!(data as { enabled: boolean }).enabled };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}