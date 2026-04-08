import {
  GithubAdapterError,
  type CreateRepoInput,
  type CreateRepoResult,
  type GithubAdapter,
  type GithubErrorCode,
} from "./adapter";

/**
 * In-memory GitHub adapter for tests and local-only flows that must not
 * reach the network. Never used in production. The behaviour is
 * deterministic: calls that match a preset error code throw, otherwise
 * the adapter returns a synthetic success.
 */
export class FakeGithubAdapter implements GithubAdapter {
  private readonly failWith: GithubErrorCode | null;
  private readonly baseHtmlUrl: string;
  calls: CreateRepoInput[] = [];

  constructor(options: { failWith?: GithubErrorCode; baseHtmlUrl?: string } = {}) {
    this.failWith = options.failWith ?? null;
    this.baseHtmlUrl = options.baseHtmlUrl ?? "https://github.local";
  }

  async createRepo(input: CreateRepoInput): Promise<CreateRepoResult> {
    this.calls.push(input);
    if (this.failWith) {
      throw new GithubAdapterError(this.failWith, `fake adapter failure: ${this.failWith}`);
    }
    return {
      ownerLogin: input.owner,
      repoName: input.name,
      htmlUrl: `${this.baseHtmlUrl}/${input.owner}/${input.name}`,
    };
  }
}
