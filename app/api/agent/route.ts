import { SYSTEM_PROMPT } from "@/lib/agent";
import {
  TOOL_DEFINITIONS,
  DANGEROUS_TOOLS,
  executeTool,
} from "@/lib/tools";
import { saveMemory, updateMemory } from "@/lib/memory";
import { isAgentEnabled } from "@/lib/agent-control";

export const runtime = "nodejs";
export const maxDuration = 60;

type Msg = {
  role: string;
  content?: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
  name?: string;
};

/** Pick free / paid brain from Vercel env (no $0 Grok needed). */
function resolveLLM(): {
  url: string;
  key: string;
  model: string;
  label: string;
  extraHeaders?: Record<string, string>;
} | null {
  const openrouter = process.env.OPENROUTER_API_KEY || "";
  if (openrouter) {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: openrouter,
      model:
        process.env.OPENROUTER_MODEL ||
        "google/gemini-2.0-flash-exp:free",
      label: "OpenRouter (free)",
      extraHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://pasiya-bot-platform.vercel.app",
        "X-Title": "PASIYA MAX Agent",
      },
    };
  }

  const gemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  if (gemini) {
    return {
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: gemini,
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      label: "Gemini (free)",
    };
  }

  const grok = process.env.GROK_API_KEY || process.env.XAI_API_KEY || "";
  if (grok) {
    return {
      url: "https://api.x.ai/v1/chat/completions",
      key: grok,
      model: process.env.GROK_MODEL || "grok-4-fast",
      label: "Grok",
    };
  }

  return null;
}

/** Real newlines required for browser SSE parsing */
function sse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const llm = resolveLLM();
  if (!llm) {
    return new Response(
      JSON.stringify({
        error:
          "No LLM key. Set GEMINI_API_KEY (free) or OPENROUTER_API_KEY (free) or GROK_API_KEY on Vercel.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: {
    messages?: Msg[];
    approved?: boolean;
    pending?: {
      tool_call_id: string;
      name: string;
      args: Record<string, unknown>;
    };
    memory_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  // Admin kill-switch — OFF = no Gemini calls (saves free quota)
  const enabled = await isAgentEnabled();
  if (!enabled) {
    return new Response(
      JSON.stringify({
        error:
          "Agent is OFF. Admin can turn it ON from /agent (Admin controls).",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const userMessages = body.messages ?? [];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(sse(obj)));

      send({
        type: "log",
        level: "info",
        text: `Brain: ${llm.label} · model ${llm.model}`,
      });

      let memoryId = body.memory_id || "";
      try {
        const lastUser = [...userMessages]
          .reverse()
          .find((m) => m.role === "user");
        if (!memoryId && lastUser?.content) {
          const row = await saveMemory({
            task: String(lastUser.content).slice(0, 500),
            status: "running",
            conversation: userMessages,
          });
          if (row?.id) {
            memoryId = row.id;
            send({ type: "memory", id: memoryId });
          }
        }
      } catch {
        /* memory optional */
      }

      const messages: Msg[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...userMessages,
      ];

      if (body.approved && body.pending) {
        const { tool_call_id, name, args } = body.pending;
        send({
          type: "log",
          level: "tool",
          text: `Executing approved tool: ${name}`,
        });
        const result = await executeTool(name, args || {});
        send({
          type: "log",
          level: name === "run_terminal" ? "sandbox" : "success",
          text: result.slice(0, 2000),
        });
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: tool_call_id,
              type: "function",
              function: {
                name,
                arguments: JSON.stringify(args || {}),
              },
            },
          ],
        });
        messages.push({
          role: "tool",
          tool_call_id,
          content: result,
        });
      } else if (body.approved === false && body.pending) {
        send({
          type: "log",
          level: "info",
          text: `User rejected tool: ${body.pending.name}`,
        });
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: body.pending.tool_call_id,
              type: "function",
              function: {
                name: body.pending.name,
                arguments: JSON.stringify(body.pending.args || {}),
              },
            },
          ],
        });
        messages.push({
          role: "tool",
          tool_call_id: body.pending.tool_call_id,
          content: JSON.stringify({
            error: "User rejected this tool call",
          }),
        });
      }

      const maxRounds = 6;
      try {
        for (let round = 0; round < maxRounds; round++) {
          send({
            type: "log",
            level: "info",
            text: `Round ${round + 1}/${maxRounds}`,
          });

          const res = await fetch(llm.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${llm.key}`,
              ...(llm.extraHeaders || {}),
            },
            body: JSON.stringify({
              model: llm.model,
              messages,
              tools: TOOL_DEFINITIONS,
              tool_choice: "auto",
              temperature: 0.3,
              max_tokens: 4096,
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            send({
              type: "error",
              text: `${llm.label} ${res.status}: ${errText.slice(0, 500)}`,
            });
            break;
          }

          const data = (await res.json()) as {
            choices?: {
              message?: {
                role: string;
                content?: string | null;
                tool_calls?: {
                  id: string;
                  type: string;
                  function: { name: string; arguments: string };
                }[];
              };
            }[];
          };

          const msg = data.choices?.[0]?.message;
          if (!msg) {
            send({ type: "error", text: "Empty model response" });
            break;
          }

          if (msg.content) {
            send({ type: "token", text: msg.content });
          }

          const toolCalls = msg.tool_calls;
          if (!toolCalls || toolCalls.length === 0) {
            messages.push({
              role: "assistant",
              content: msg.content || "",
            });
            break;
          }

          messages.push({
            role: "assistant",
            content: msg.content || null,
            tool_calls: toolCalls,
          });

          let pausedForApproval = false;

          for (const tc of toolCalls) {
            const name = tc.function?.name;
            if (!name) continue;
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(tc.function.arguments || "{}");
            } catch {
              args = {};
            }

            send({
              type: "log",
              level: "tool",
              text: `Tool: ${name}(${JSON.stringify(args).slice(0, 180)})`,
            });

            if (DANGEROUS_TOOLS.has(name)) {
              send({
                type: "approval",
                tool_call_id: tc.id,
                name,
                args,
                reason: `Agent wants to run ${name}. Approve to continue.`,
                memory_id: memoryId || undefined,
              });
              pausedForApproval = true;
              break;
            }

            const result = await executeTool(name, args);
            send({
              type: "log",
              level: name.includes("memory") ? "mem" : "success",
              text: result.slice(0, 2000),
            });
            messages.push({
              role: "tool",
              tool_call_id: tc.id,
              content: result,
            });
          }

          if (pausedForApproval) {
            send({ type: "done", memory_id: memoryId || undefined });
            controller.close();
            return;
          }
        }

        if (memoryId) {
          await updateMemory(memoryId, {
            status: "completed",
            conversation: messages.filter((m) => m.role !== "system"),
          });
          send({
            type: "log",
            level: "mem",
            text: `Memory saved: ${memoryId}`,
          });
        }

        send({ type: "done", memory_id: memoryId || undefined });
      } catch (e) {
        send({
          type: "error",
          text: e instanceof Error ? e.message : String(e),
        });
        send({ type: "done" });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
} 
