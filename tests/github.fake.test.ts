import { describe, expect, it } from "vitest";
import { FakeGithubAdapter } from "@/lib/github/fake";
import { GithubAdapterError } from "@/lib/github/adapter";

describe("FakeGithubAdapter", () => {
  it("returns a synthetic success and records the call", async () => {
    const adapter = new FakeGithubAdapter();
    const result = await adapter.createRepo({
      owner: "octocat",
      name: "hello-world",
      private: true,
    });
    expect(result).toEqual({
      ownerLogin: "octocat",
      repoName: "hello-world",
      htmlUrl: "https://github.local/octocat/hello-world",
    });
    expect(adapter.calls).toHaveLength(1);
    expect(adapter.calls[0]?.owner).toBe("octocat");
  });

  it("throws the configured error code when failWith is set", async () => {
    const adapter = new FakeGithubAdapter({
      failWith: "GITHUB_REPO_ALREADY_EXISTS",
    });
    await expect(
      adapter.createRepo({ owner: "octocat", name: "hello-world", private: true }),
    ).rejects.toBeInstanceOf(GithubAdapterError);
    try {
      await adapter.createRepo({
        owner: "octocat",
        name: "hello-world",
        private: true,
      });
    } catch (error) {
      expect((error as GithubAdapterError).code).toBe("GITHUB_REPO_ALREADY_EXISTS");
    }
  });
});
