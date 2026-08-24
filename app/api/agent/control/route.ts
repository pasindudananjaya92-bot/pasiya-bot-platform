import { isAgentEnabled, setAgentEnabled } from "@/lib/agent-control";

export const runtime = "nodejs";

export async function GET() {
  const enabled = await isAgentEnabled();
  return Response.json({ enabled });
}

export async function POST(req: Request) {
  const adminSecret = process.env.AGENT_ADMIN_SECRET || "";
  if (!adminSecret) {
    return Response.json(
      {
        ok: false,
        error:
          "AGENT_ADMIN_SECRET not set on Vercel. Add a secret password in Environment Variables.",
      },
      { status: 500 }
    );
  }

  let body: { enabled?: boolean; secret?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.secret !== adminSecret) {
    return Response.json(
      { ok: false, error: "Wrong admin secret" },
      { status: 401 }
    );
  }

  if (typeof body.enabled !== "boolean") {
    return Response.json(
      { ok: false, error: "enabled must be true or false" },
      { status: 400 }
    );
  }

  const result = await setAgentEnabled(body.enabled);
  if (!result.ok) {
    return Response.json(result, { status: 500 });
  }
  return Response.json({
    ok: true,
    enabled: result.enabled,
    message: result.enabled
      ? "Agent is ON — visitors can use it"
      : "Agent is OFF — saves Gemini quota",
  });
}