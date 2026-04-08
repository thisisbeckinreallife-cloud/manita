import { describe, expect, it } from "vitest";
import { createFolderInput } from "@/lib/validation/folder";

describe("createFolderInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = createFolderInput.safeParse({ projectId: "p1", name: "Inbox" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Inbox");
      expect(result.data.projectId).toBe("p1");
    }
  });

  it("trims whitespace from the name", () => {
    const result = createFolderInput.safeParse({ projectId: "p1", name: "  Trim  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Trim");
  });

  it("rejects an empty name", () => {
    const result = createFolderInput.safeParse({ projectId: "p1", name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    const result = createFolderInput.safeParse({ projectId: "p1", name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 80 characters", () => {
    const result = createFolderInput.safeParse({
      projectId: "p1",
      name: "x".repeat(81),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing projectId", () => {
    const result = createFolderInput.safeParse({ name: "Inbox" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty projectId", () => {
    const result = createFolderInput.safeParse({ projectId: "", name: "Inbox" });
    expect(result.success).toBe(false);
  });
});
