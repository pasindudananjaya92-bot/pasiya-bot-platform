export const runtime = "nodejs";
export async function POST(req: Request) {
  const webhook = process.env.N8N_CHAT_WEBHOOK || process.env.MAKE_CHAT_WEBHOOK || process.env.N8N_WEBHOOK_URL || "";
  if (!webhook) {
    return Response.json( { error: "Chat offline. Admin: set N8N_CHAT_WEBHOOK on Vercel.", }, { status: 503 } );
  }
  let body: { message?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const message = String(body.message || "").trim();
  if (!message) { return Response.json({ error: "Empty message" }, { status: 400 }); }
  try {
    const res = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, source: "pasiya-chat-bubble", ts: new Date().toISOString(), }), });
    const raw = await res.text();
    let reply = raw;
    try { const j = JSON.parse(raw); reply = j.reply || j.message || j.text || j.output || (typeof j === "string" ? j : JSON.stringify(j)); } catch { }
    if (!res.ok) { return Response.json( { error: `Webhook ${res.status}: ${String(reply).slice(0, 300)}` }, { status: 502 } ); }
    return Response.json({ reply: String(reply).slice(0, 4000) || "(empty response)", });
  } catch (e) { return Response.json( { error: "Webhook request failed: " + (e instanceof Error ? e.message : String(e)), }, { status: 502 } ); }
} 
