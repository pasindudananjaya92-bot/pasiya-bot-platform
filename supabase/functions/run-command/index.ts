// Supabase Edge Function: run-command
// Deploy: supabase functions deploy run-command
// Path in repo: supabase/functions/run-command/index.ts
//
// Vercel has no real shell. This is a **limited sandbox / guidance** layer.
// It does NOT give you a full Node host with npm install persistence.
// Safe allowlist only — expand carefully.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOW = [
  /^ls(\s|$)/,
  /^pwd$/,
  /^echo\s/,
  /^node\s+-e\s+/,
  /^node\s+--version$/,
  /^npm\s+--version$/,
  /^cat\s+[\w./-]+$/,
  /^wc\s/,
  /^head\s/,
  /^date$/,
  /^uname/,
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { command } = (await req.json()) as { command?: string };
    const cmd = (command || "").trim();
    if (!cmd) {
      return Response.json(
        { ok: false, stderr: "Empty command" },
        { status: 400 }
      );
    }

    const allowed = ALLOW.some((re) => re.test(cmd));
    if (!allowed) {
      return Response.json({
        ok: false,
        stdout: "",
        stderr: `Command not in allowlist: ${cmd}`,
        note:
          "Edge sandbox is limited. For real code changes use write_file → GitHub commit. Deploy heavy builds on Vercel after push.",
        guidance: [
          "Allowed examples: ls, pwd, echo, node --version, npm --version, cat path, date",
          "npm install / long builds are NOT supported here",
          "Write files via the agent write_file tool instead",
        ],
      });
    }

    // Deno subprocess — ephemeral, no persistent project disk on Vercel
    const proc = new Deno.Command("sh", {
      args: ["-c", cmd],
      stdout: "piped",
      stderr: "piped",
    });
    const out = await proc.output();
    const stdout = new TextDecoder().decode(out.stdout);
    const stderr = new TextDecoder().decode(out.stderr);

    return Response.json({
      ok: out.success,
      code: out.code,
      stdout: stdout.slice(0, 8000),
      stderr: stderr.slice(0, 4000),
      note: "Ephemeral Edge sandbox — not your Vercel project filesystem",
    });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        stderr: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
});
