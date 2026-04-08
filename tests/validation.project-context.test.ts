import { describe, expect, it } from "vitest";
import { createProjectContextInput } from "@/lib/validation/project-context";

describe("createProjectContextInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = createProjectContextInput.safeParse({
      projectId: "p1",
      label: "Architecture",
      content: "We use adapters, SQLite, and honest state.",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from label and content", () => {
    const result = createProjectContextInput.safeParse({
      projectId: "p1",
      label: "  Arch  ",
      content: "  Body  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.label).toBe("Arch");
      expect(result.data.content).toBe("Body");
    }
  });

  it("rejects an empty label", () => {
    const result = createProjectContextInput.safeParse({
      projectId: "p1",
      label: "",
      content: "b",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty content", () => {
    const result = createProjectContextInput.safeParse({
      projectId: "p1",
      label: "x",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a label longer than 120 characters", () => {
    const result = createProjectContextInput.safeParse({
      projectId: "p1",
      label: "x".repeat(121),
      content: "c",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content longer than 8000 characters", () => {
    const result = createProjectContextInput.safeParse({
      projectId: "p1",
      label: "l",
      content: "x".repeat(8001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing projectId", () => {
    const result = createProjectContextInput.safeParse({
      label: "l",
      content: "c",
    });
    expect(result.success).toBe(false);
  });
});
