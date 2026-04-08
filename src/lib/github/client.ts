import {
  GithubAdapterError,
  type CreateRepoInput,
  type CreateRepoResult,
  type GithubAdapter,
} from "./adapter";

/**
 * Production GitHub adapter using the native fetch client. Requires a
 * Personal Access Token (classic or fine-grained) with the `repo` scope
 * supplied via the GITHUB_TOKEN environment variable. When the token is
 * missing, every call throws GITHUB_TOKEN_NOT_CONFIGURED — the server
 * layer surfaces that as a FAILED repository link and the RightPane
 * renders it honestly.
 *
 * Nothing outside src/lib/github/** may import this file directly; the
 * entry point is src/server/repository-links.ts via the adapter interface.
 */
export class GithubHttpClient implements GithubAdapter {
  private readonly token: string | undefined;
  private readonly baseUrl: string;

  constructor(options: { token?: string; baseUrl?: string } = {}) {
    this.token = options.token ?? process.env.GITHUB_TOKEN;
    this.baseUrl = options.baseUrl ?? "https://api.github.com";
  }

  async createRepo(input: CreateRepoInput): Promise<CreateRepoResult> {
    if (!this.token) {
      throw new GithubAdapterError(
        "GITHUB_TOKEN_NOT_CONFIGURED",
        "Set the GITHUB_TOKEN environment variable on the server.",
      );
    }

    // We always create under the authenticated user for MVP. Creating
    // under an org is a follow-up slice (different endpoint: POST /orgs/:org/repos).
    const response = await fetch(`${this.baseUrl}/user/repos`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "User-Agent": "vibe-workspace",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        name: input.name,
        private: input.private,
        auto_init: true,
      }),
    });

    if (response.ok) {
      const body = (await response.json()) as {
        name: string;
        owner: { login: string };
        html_url: string;
      };
      // Sanity-check the returned owner against what the user requested.
      // If they mismatch, surface it honestly rather than silently using
      // whoever the token belongs to.
      if (body.owner.login.toLowerCase() !== input.owner.toLowerCase()) {
        throw new GithubAdapterError(
          "GITHUB_FORBIDDEN",
          `Requested owner "${input.owner}" but token belongs to "${body.owner.login}".`,
          response.status,
        );
      }
      return {
        ownerLogin: body.owner.login,
        repoName: body.name,
        htmlUrl: body.html_url,
      };
    }

    const detail = await safeReadErrorBody(response);
    throw new GithubAdapterError(
      mapStatusToCode(response.status, detail),
      detail,
      response.status,
    );
  }
}

async function safeReadErrorBody(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: string };
    return body?.message ?? null;
  } catch {
    return null;
  }
}

function mapStatusToCode(
  status: number,
  detail: string | null,
): GithubAdapterError["code"] {
  if (status === 401) return "GITHUB_UNAUTHORIZED";
  if (status === 403) return "GITHUB_FORBIDDEN";
  if (status === 422) {
    if (detail && /already exists/i.test(detail)) {
      return "GITHUB_REPO_ALREADY_EXISTS";
    }
    return "GITHUB_VALIDATION_FAILED";
  }
  return "GITHUB_UNKNOWN_ERROR";
}
