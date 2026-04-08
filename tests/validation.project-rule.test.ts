import { describe, expect, it } from "vitest";
import { createProjectRuleInput } from "@/lib/validation/project-rule";

describe("createProjectRuleInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = createProjectRuleInput.safeParse({
      projectId: "p1",
      title: "Prefer adapters",
      body: "Never import a vendor SDK outside src/lib/<vendor>/**",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Prefer adapters");
      expect(result.data.body).toContain("vendor SDK");
    }
  });

  it("trims whitespace from title and body", () => {
    const result = createProjectRuleInput.safeParse({
      projectId: "p1",
      title: "  Trim me  ",
      body: "  Body  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Trim me");
      expect(result.data.body).toBe("Body");
    }
  });

  it("rejects an empty title", () => {
    const result = createProjectRuleInput.safeParse({
      projectId: "p1",
      title: "",
      body: "x",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty body", () => {
    const result = createProjectRuleInput.safeParse({
      projectId: "p1",
      title: "x",
      body: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a title longer than 120 characters", () => {
    const result = createProjectRuleInput.safeParse({
      projectId: "p1",
      title: "x".repeat(121),
      body: "b",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a body longer than 4000 characters", () => {
    const result = createProjectRuleInput.safeParse({
      projectId: "p1",
      title: "t",
      body: "x".repeat(4001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing projectId", () => {
    const result = createProjectRuleInput.safeParse({
      title: "t",
      body: "b",
    });
    expect(result.success).toBe(false);
  });
});
