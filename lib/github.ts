const GITHUB_API = "https://api.github.com";

export interface GithubPushFile {
  path: string;
  content: string;
}

export interface GithubPushResult {
  commitSha: string;
  commitUrl: string;
  branch: string;
  changedFiles: string[];
  skipped?: boolean;
}

export function getGithubRepo(): string {
  return process.env.GITHUB_REPO || "KtsTrinh/acd-arc";
}

export function getGithubBranch(): string {
  return process.env.GITHUB_BRANCH || "main";
}

export function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

async function githubRequest<T>(
  path: string,
  init: RequestInit = {},
  method = "GET"
): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "Chưa cấu hình GITHUB_TOKEN. Hãy thêm secret GITHUB_TOKEN vào Vercel."
    );
  }

  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    method,
    signal: init.signal ?? AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
      "User-Agent": "acd-architecture-cms-sync",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `GitHub API ${method} ${path} -> ${response.status}: ${text.slice(0, 300)}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

interface GithubRef {
  object: { sha: string };
}

interface GithubCommit {
  sha: string;
  tree: { sha: string };
}

interface GithubBlob {
  sha: string;
}

interface GithubTree {
  sha: string;
}

interface GithubNewCommit {
  sha: string;
  html_url: string;
}

/**
 * Ghi nhiều file vào GitHub bằng 1 commit duy nhất (Git Data API).
 * Push vào nhánh production sẽ kích hoạt Vercel deploy tự động.
 */
export async function pushFilesToGithub(
  files: GithubPushFile[],
  commitMessage: string
): Promise<GithubPushResult> {
  if (files.length === 0) {
    throw new Error("Không có nội dung nào để đồng bộ.");
  }

  const repo = getGithubRepo();
  const branch = getGithubBranch();

  const ref = await githubRequest<GithubRef>(
    `/repos/${repo}/git/ref/heads/${branch}`
  );
  const baseCommitSha = ref.object.sha;

  const baseCommit = await githubRequest<GithubCommit>(
    `/repos/${repo}/git/commits/${baseCommitSha}`
  );

  const treeEntries: {
    path: string;
    mode: "100644";
    type: "blob";
    sha: string;
  }[] = [];

  for (const file of files) {
    const blob = await githubRequest<GithubBlob>(
      `/repos/${repo}/git/blobs`,
      {
        body: JSON.stringify({
          content: Buffer.from(file.content, "utf8").toString("base64"),
          encoding: "base64",
        }),
      },
      "POST"
    );

    treeEntries.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  const tree = await githubRequest<GithubTree>(
    `/repos/${repo}/git/trees`,
    {
      body: JSON.stringify({
        base_tree: baseCommit.tree.sha,
        tree: treeEntries,
      }),
    },
    "POST"
  );

  // Nội dung không đổi -> không tạo commit rỗng
  if (tree.sha === baseCommit.tree.sha) {
    return {
      commitSha: baseCommitSha,
      commitUrl: `https://github.com/${repo}/commit/${baseCommitSha}`,
      branch,
      changedFiles: [],
      skipped: true,
    };
  }

  const newCommit = await githubRequest<GithubNewCommit>(
    `/repos/${repo}/git/commits`,
    {
      body: JSON.stringify({
        message: commitMessage,
        tree: tree.sha,
        parents: [baseCommitSha],
      }),
    },
    "POST"
  );

  await githubRequest<GithubRef>(
    `/repos/${repo}/git/refs/heads/${branch}`,
    {
      body: JSON.stringify({
        sha: newCommit.sha,
        force: false,
      }),
    },
    "PATCH"
  );

  return {
    commitSha: newCommit.sha,
    commitUrl: newCommit.html_url,
    branch,
    changedFiles: files.map((file) => file.path),
  };
}
