import { describe, expect, it } from "vitest";
import { requestBootstrapInput } from "@/lib/validation/repository-link";

describe("requestBootstrapInput", () => {
  it("accepts a minimal valid payload and defaults private to true", () => {
    const result = requestBootstrapInput.safeParse({
      projectId: "p1",
      owner: "octocat",
      name: "hello-world",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.owner).toBe("octocat");
      expect(result.data.name).toBe("hello-world");
      expect(result.data.private).toBe(true);
    }
  });

  it("preserves an explicit private=false", () => {
    const result = requestBootstrapInput.safeParse({
      projectId: "p1",
      owner: "octocat",
      name: "hello-world",
      private: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.private).toBe(false);
  });

  it("trims whitespace from owner and name", () => {
    const result = requestBootstrapInput.safeParse({
      projectId: "p1",
      owner: "  octocat  ",
      name: "  hello-world  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.owner).toBe("octocat");
      expect(result.data.name).toBe("hello-world");
    }
  });

  it("rejects an empty projectId", () => {
    const result = requestBootstrapInput.safeParse({
      projectId: "",
      owner: "octocat",
      name: "hello-world",
    });
    expect(result.success).toBe(false);
  });

  it("rejects owner with invalid characters", () => {
    for (const owner of ["has space", "has/slash", "has.dot", "-starts-dash"]) {
      const result = requestBootstrapInput.safeParse({
        projectId: "p1",
        owner,
        name: "hello-world",
      });
      expect(result.success, `owner="${owner}" should be invalid`).toBe(false);
    }
  });

  it("rejects owner longer than 39 characters", () => {
    const result = requestBootstrapInput.safeParse({
      projectId: "p1",
      owner: "a".repeat(40),
      name: "hello-world",
    });
    expect(result.success).toBe(false);
  });

  it("accepts repo names with dots, dashes, and underscores", () => {
    for (const name of ["hello-world", "hello.world", "hello_world", "v1.2.3"]) {
      const result = requestBootstrapInput.safeParse({
        projectId: "p1",
        owner: "octocat",
        name,
      });
      expect(result.success, `name="${name}" should be valid`).toBe(true);
    }
  });

  it("rejects repo names with slashes or spaces", () => {
    for (const name of ["has/slash", "has space", ""]) {
      const result = requestBootstrapInput.safeParse({
        projectId: "p1",
        owner: "octocat",
        name,
      });
      expect(result.success, `name="${name}" should be invalid`).toBe(false);
    }
  });

  it("rejects repo names longer than 100 characters", () => {
    const result = requestBootstrapInput.safeParse({
      projectId: "p1",
      owner: "octocat",
      name: "x".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});
