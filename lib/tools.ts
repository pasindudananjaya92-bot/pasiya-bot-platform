import {
  listRepoFiles,
  readRepoFile,
  writeRepoFile,
  deleteRepoFile,
  createPullRequest,
} from "./github";
import {
  saveMemory,
  recentMemory,
  cacheFile,
  updateMemory,
} from "./memory";

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "list_files",
      description: "List files/folders in the GitHub repo at a path (default root).",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path, empty for root" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "read_file",
      description: "Read a file from the GitHub repo.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "File path relative to repo root" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "write_file",
      description:
        "Cache file to Supabase Storage + agent_files, then commit to GitHub. Requires approval.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
          message: { type: "string", description: "Commit message" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_file",
      description: "Delete a file from GitHub. Requires approval.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          message: { type: "string" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "run_terminal",
      description:
        "Run a command via Supabase Edge Function sandbox (limited). Requires approval.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string" },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_web",
      description: "Search the web for factual information (returns guidance text).",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_pr",
      description: "Create a GitHub pull request. Requires approval.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          head: { type: "string", description: "Branch with changes" },
          base: { type: "string", description: "Target branch (default main)" },
        },
        required: ["title", "head"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "save_memory",
      description: "Save task plan/status to Supabase agent_memory.",
      parameters: {
        type: "object",
        properties: {
          task: { type: "string" },
          steps: { type: "array", items: { type: "string" } },
          status: { type: "string" },
          memory_id: {
            type: "string",
            description: "If set, update existing memory row",
          },
        },
        required: ["task"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "recall_memory",
      description: "Recall recent agent_memory rows from Supabase.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
        },
      },
    },
  },
];

export const DANGEROUS_TOOLS = new Set([
  "write_file",
  "delete_file",
  "run_terminal",
  "create_pr",
]);

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    switch (name) {
      case "list_files": {
        const path = String(args.path ?? "");
        const files = await listRepoFiles(path);
        return JSON.stringify(files, null, 2);
      }
      case "read_file": {
        const path = String(args.path ?? "");
        const { content, sha } = await readRepoFile(path);
        const preview =
          content.length > 12000
            ? content.slice(0, 12000) + "\n…[truncated]"
            : content;
        return JSON.stringify({ path, sha, content: preview });
      }
      case "write_file": {
        const path = String(args.path ?? "");
        const content = String(args.content ?? "");
        const message =
          String(args.message ?? "") || `agent: update ${path}`;
        const cached = await cacheFile(path, content);
        const gh = await writeRepoFile(path, content, message);
        return JSON.stringify({
          cached: cached.ok,
          cache_error: cached.error,
          github: gh,
        });
      }
      case "delete_file": {
        const path = String(args.path ?? "");
        const message =
          String(args.message ?? "") || `agent: delete ${path}`;
        const r = await deleteRepoFile(path, message);
        return JSON.stringify(r);
      }
      case "run_terminal": {
        const command = String(args.command ?? "");
        const base =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.SUPABASE_URL ||
          "";
        const key =
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          "";
        if (!base) {
          return JSON.stringify({
            ok: false,
            stdout: "",
            stderr:
              "Supabase URL missing. Edge sandbox unavailable. On Vercel use GitHub commits for real changes.",
            note: "guidance",
          });
        }
        try {
          const res = await fetch(`${base}/functions/v1/run-command`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ command }),
          });
          const text = await res.text();
          let body: unknown = text;
          try {
            body = JSON.parse(text);
          } catch {
            /* keep text */
          }
          return JSON.stringify({
            ok: res.ok,
            status: res.status,
            result: body,
          });
        } catch (e) {
          return JSON.stringify({
            ok: false,
            stderr: e instanceof Error ? e.message : String(e),
            note: "Edge Function not deployed or unreachable. Deploy supabase/functions/run-command.",
          });
        }
      }
      case "search_web": {
        const query = String(args.query ?? "");
        return JSON.stringify({
          query,
          note: "No external search key configured. Use your training knowledge and repo tools. For live search add a search API later.",
        });
      }
      case "create_pr": {
        const r = await createPullRequest(
          String(args.title ?? "Agent PR"),
          String(args.body ?? ""),
          String(args.head ?? ""),
          args.base ? String(args.base) : undefined
        );
        return JSON.stringify(r);
      }
      case "save_memory": {
        const task = String(args.task ?? "");
        const steps = Array.isArray(args.steps) ? args.steps : [];
        const status = String(args.status ?? "running");
        const memoryId = args.memory_id ? String(args.memory_id) : "";
        if (memoryId) {
          await updateMemory(memoryId, { steps, status });
          return JSON.stringify({ ok: true, id: memoryId, updated: true });
        }
        const row = await saveMemory({ task, steps, status });
        return JSON.stringify({
          ok: !!row,
          id: row?.id ?? null,
        });
      }
      case "recall_memory": {
        const limit = Number(args.limit ?? 8);
        const rows = await recentMemory(limit);
        return JSON.stringify(rows);
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (e) {
    return JSON.stringify({
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
