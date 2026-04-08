import { describe, expect, it } from "vitest";
import { createProjectInput } from "@/lib/validation/project";

describe("createProjectInput", () => {
  it("accepts a minimal valid name", () => {
    const result = createProjectInput.safeParse({ name: "Vibe" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Vibe");
      expect(result.data.description).toBeUndefined();
    }
  });

  it("trims whitespace from the name", () => {
    const result = createProjectInput.safeParse({ name: "  Trim me  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Trim me");
  });

  it("rejects an empty name", () => {
    const result = createProjectInput.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "name");
      expect(issue?.message).toBe("Project name is required");
    }
  });

  it("rejects a name longer than 80 characters", () => {
    const result = createProjectInput.safeParse({ name: "x".repeat(81) });
    expect(result.success).toBe(false);
  });

  it("treats an empty description as undefined", () => {
    const result = createProjectInput.safeParse({ name: "Vibe", description: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeUndefined();
  });

  it("treats a whitespace-only description as undefined", () => {
    const result = createProjectInput.safeParse({ name: "Vibe", description: "   " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeUndefined();
  });

  it("treats a null description as undefined", () => {
    const result = createProjectInput.safeParse({ name: "Vibe", description: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeUndefined();
  });

  it("rejects a description longer than 500 characters", () => {
    const result = createProjectInput.safeParse({
      name: "Vibe",
      description: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
