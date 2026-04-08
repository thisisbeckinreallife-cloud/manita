// GitHub adapter contract. Everything that touches api.github.com lives
// under src/lib/github/**. The rest of the app targets this interface so
// the implementation can be swapped for tests without mocking fetch.

export type CreateRepoInput = {
  owner: string;
  name: string;
  private: boolean;
};

export type CreateRepoResult = {
  ownerLogin: string;
  repoName: string;
  htmlUrl: string;
};

/**
 * Structured error codes the adapter may surface. The server layer maps
 * these to user-facing states. Adding a new code requires a matching
 * branch in the UI.
 */
export type GithubErrorCode =
  | "GITHUB_TOKEN_NOT_CONFIGURED"
  | "GITHUB_REPO_ALREADY_EXISTS"
  | "GITHUB_UNAUTHORIZED"
  | "GITHUB_FORBIDDEN"
  | "GITHUB_VALIDATION_FAILED"
  | "GITHUB_UNKNOWN_ERROR";

export class GithubAdapterError extends Error {
  readonly code: GithubErrorCode;
  readonly status: number | null;
  readonly detail: string | null;
  constructor(code: GithubErrorCode, detail: string | null = null, status: number | null = null) {
    super(code);
    this.name = "GithubAdapterError";
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

export interface GithubAdapter {
  createRepo(input: CreateRepoInput): Promise<CreateRepoResult>;
}
