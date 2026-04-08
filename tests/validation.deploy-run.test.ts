import { describe, expect, it } from "vitest";
import { requestDeployInput } from "@/lib/validation/deploy-run";

describe("requestDeployInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = requestDeployInput.safeParse({ projectId: "p1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.commitSha).toBeUndefined();
      expect(result.data.branch).toBeUndefined();
    }
  });

  it("accepts a 7-char sha", () => {
    const result = requestDeployInput.safeParse({
      projectId: "p1",
      commitSha: "abcdef1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a 40-char sha", () => {
    const result = requestDeployInput.safeParse({
      projectId: "p1",
      commitSha: "a".repeat(40),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a 6-char or 41-char sha", () => {
    expect(
      requestDeployInput.safeParse({ projectId: "p1", commitSha: "abcdef" })
        .success,
    ).toBe(false);
    expect(
      requestDeployInput.safeParse({
        projectId: "p1",
        commitSha: "a".repeat(41),
      }).success,
    ).toBe(false);
  });

  it("rejects a sha with non-hex characters", () => {
    const result = requestDeployInput.safeParse({
      projectId: "p1",
      commitSha: "zzzzzzz",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid branch name", () => {
    for (const branch of ["main", "feature/foo", "release-1.2", "v1.2.3"]) {
      const result = requestDeployInput.safeParse({
        projectId: "p1",
        branch,
      });
      expect(result.success, `branch="${branch}"`).toBe(true);
    }
  });

  it("rejects a branch with spaces", () => {
    const result = requestDeployInput.safeParse({
      projectId: "p1",
      branch: "has space",
    });
    expect(result.success).toBe(false);
  });

  it("treats empty commitSha and branch as undefined", () => {
    const result = requestDeployInput.safeParse({
      projectId: "p1",
      commitSha: "",
      branch: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.commitSha).toBeUndefined();
      expect(result.data.branch).toBeUndefined();
    }
  });
});
