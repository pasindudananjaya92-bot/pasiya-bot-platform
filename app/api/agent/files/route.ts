import { listRepoFiles, readRepoFile } from "@/lib/github";
import { listCachedFiles } from "@/lib/memory";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const mode = searchParams.get("mode") || "list";

  try {
    if (mode === "read") {
      if (!path) {
        return Response.json({ error: "path required" }, { status: 400 });
      }
      const file = await readRepoFile(path);
      return Response.json({ path, ...file });
    }

    const [gh, cache] = await Promise.all([
      listRepoFiles(path).catch(() => []),
      listCachedFiles().catch(() => []),
    ]);

    const cachePaths = new Set(cache.map((c) => c.path));
    const merged = [
      ...gh.map((f) => ({
        ...f,
        cached: cachePaths.has(f.path),
      })),
      ...cache
        .filter((c) => !gh.some((g) => g.path === c.path))
        .map((c) => ({
          path: c.path,
          type: "file" as const,
          cached: true,
          source: "cache" as const,
        })),
    ];

    return Response.json({
      path,
      files: merged,
      cache_count: cache.length,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
} 
