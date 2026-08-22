const API = "https://api.github.com";

function cfg() {
  const token = process.env.GITHUB_TOKEN || "";
  const owner =
    process.env.GITHUB_OWNER ||
    process.env.NEXT_PUBLIC_GITHUB_OWNER ||
    "pasindudananjaya92-bot";
  const repo =
    process.env.GITHUB_REPO ||
    process.env.NEXT_PUBLIC_GITHUB_REPO ||
    "pasiya-bot-platform";
  const branch =
    process.env.GITHUB_BRANCH ||
    process.env.NEXT_PUBLIC_GITHUB_BRANCH ||
    "main";
  return { token, owner, repo, branch };
}

function headers(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

export async function listRepoFiles(path = ""): Promise<
  { path: string; type: "file" | "dir"; size?: number }[]
> {
  const { token, owner, repo, branch } = cfg();
  if (!token) throw new Error("GITHUB_TOKEN missing");
  const url = `${API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: headers(token), cache: "no-store" });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub list ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    return [
      {
        path: data.path as string,
        type: data.type === "dir" ? "dir" : "file",
        size: data.size,
      },
    ];
  }
  return data.map(
    (f: { path: string; type: string; size?: number }) => ({
      path: f.path,
      type: f.type === "dir" ? ("dir" as const) : ("file" as const),
      size: f.size,
    })
  );
}

export async function readRepoFile(
  path: string
): Promise<{ content: string; sha: string }> {
  const { token, owner, repo, branch } = cfg();
  if (!token) throw new Error("GITHUB_TOKEN missing");
  const url = `${API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: headers(token), cache: "no-store" });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub read ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    content?: string;
    encoding?: string;
    sha: string;
  };
  if (!data.content) throw new Error("No content (maybe a directory)");
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { content, sha: data.sha };
}

export async function writeRepoFile(
  path: string,
  content: string,
  message: string
): Promise<{ ok: boolean; sha?: string; html_url?: string; error?: string }> {
  const { token, owner, repo, branch } = cfg();
  if (!token) return { ok: false, error: "GITHUB_TOKEN missing" };

  let sha: string | undefined;
  try {
    const existing = await readRepoFile(path);
    sha = existing.sha;
  } catch {
    /* new file */
  }

  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `${API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: headers(token),
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    return {
      ok: false,
      error: (data as { message?: string }).message || res.statusText,
    };
  }
  return {
    ok: true,
    sha: (data as { content?: { sha?: string } }).content?.sha,
    html_url: (data as { content?: { html_url?: string } }).content?.html_url,
  };
}

export async function deleteRepoFile(
  path: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  const { token, owner, repo, branch } = cfg();
  if (!token) return { ok: false, error: "GITHUB_TOKEN missing" };
  let sha: string;
  try {
    const existing = await readRepoFile(path);
    sha = existing.sha;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "File not found",
    };
  }
  const res = await fetch(
    `${API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "DELETE",
      headers: headers(token),
      body: JSON.stringify({ message, sha, branch }),
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: (data as { message?: string }).message || res.statusText,
    };
  }
  return { ok: true };
}

export async function createPullRequest(
  title: string,
  body: string,
  head: string,
  base?: string
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const { token, owner, repo, branch } = cfg();
  if (!token) return { ok: false, error: "GITHUB_TOKEN missing" };
  const res = await fetch(`${API}/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      title,
      body,
      head,
      base: base || branch,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      ok: false,
      error: (data as { message?: string }).message || res.statusText,
    };
  }
  return { ok: true, url: (data as { html_url?: string }).html_url };
}
