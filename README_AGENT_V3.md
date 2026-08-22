# PASIYA MAX — Agent V3 (Supabase + Grok + GitHub)

Stronger than Step 11:

| Feature | Step 11 | V3 |
|--------|---------|-----|
| Grok tool loop | Yes | Yes (`grok-4-fast`) |
| GitHub read/write | Yes | Yes + PR |
| Task memory | No | `agent_memory` table |
| File cache | No | `agent_files` + Storage `project-files` |
| Terminal | Simulated | Supabase Edge `run-command` (limited sandbox) |
| Approval gate | Basic | Full UI + Diff + Explorer |

## Honest limits (Vercel)

- **No real VM / Docker / persistent shell** on Vercel.
- **Real code changes = GitHub commits** (Contents API).
- Edge Function is an **allowlisted sandbox / guidance** layer — not `npm install` host.

## Setup

1. Run `00_SQL_RUN_IN_SUPABASE.sql` in Supabase SQL Editor.
2. Storage → bucket `project-files` (private) if SQL insert failed.
3. Upload folders per `00_SINHALA_UPLOAD.txt`.
4. Vercel env: `GROK_API_KEY`, `GITHUB_TOKEN`, `NEXT_PUBLIC_SUPABASE_*`, optional `SUPABASE_SERVICE_ROLE_KEY`.
5. Optional: `supabase functions deploy run-command`.
6. Open `https://pasiya-bot-platform.vercel.app/agent`

## Test prompts

- `List files in the repo`
- `Remember this task: test memory`
- `Read package.json`
- `Create a file docs/agent-test.md with hello` → Approve

## Optional nav

In `lib/nav.ts` add or change AI Agent href to `/agent`:

```ts
{ href: "/agent", label: "Agent Workspace", icon: "🛠", group: "Main" },
```
