import { describe, expect, it } from "vitest";
import { createTaskInput } from "@/lib/validation/task";

describe("createTaskInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = createTaskInput.safeParse({ folderId: "f1", title: "Ship slice 0c" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Ship slice 0c");
      expect(result.data.description).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("trims whitespace from the title", () => {
    const result = createTaskInput.safeParse({ folderId: "f1", title: "  Trim me  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Trim me");
  });

  it("rejects an empty title", () => {
    const result = createTaskInput.safeParse({ folderId: "f1", title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a title longer than 120 characters", () => {
    const result = createTaskInput.safeParse({
      folderId: "f1",
      title: "x".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing folderId", () => {
    const result = createTaskInput.safeParse({ title: "Hi" });
    expect(result.success).toBe(false);
  });

  it("normalizes empty description to undefined", () => {
    const result = createTaskInput.safeParse({
      folderId: "f1",
      title: "Hi",
      description: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeUndefined();
  });

  it("normalizes whitespace-only description to undefined", () => {
    const result = createTaskInput.safeParse({
      folderId: "f1",
      title: "Hi",
      description: "   ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeUndefined();
  });

  it("rejects a description longer than 2000 characters", () => {
    const result = createTaskInput.safeParse({
      folderId: "f1",
      title: "Hi",
      description: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts each valid status value", () => {
    for (const status of ["OPEN", "IN_PROGRESS", "DONE", "ARCHIVED"] as const) {
      const result = createTaskInput.safeParse({
        folderId: "f1",
        title: "Hi",
        status,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.status).toBe(status);
    }
  });

  it("rejects an unknown status value", () => {
    const result = createTaskInput.safeParse({
      folderId: "f1",
      title: "Hi",
      status: "BLOCKED",
    });
    expect(result.success).toBe(false);
  });
});
