import { describe, expect, it } from "vitest";
import { createMessageInput } from "@/lib/validation/message";

describe("createMessageInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = createMessageInput.safeParse({ taskId: "t1", content: "Hello" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taskId).toBe("t1");
      expect(result.data.content).toBe("Hello");
      expect(result.data.role).toBeUndefined();
      expect(result.data.kind).toBeUndefined();
      expect(result.data.payload).toBeUndefined();
      expect(result.data.parentMessageId).toBeUndefined();
    }
  });

  it("accepts all structured-message fields", () => {
    const result = createMessageInput.safeParse({
      taskId: "t1",
      content: "grep project",
      kind: "TOOL_CALL",
      payload: '{"tool":"grep","command":"grep -n foo src"}',
      parentMessageId: "parent-1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.kind).toBe("TOOL_CALL");
      expect(result.data.payload).toContain("grep -n foo");
      expect(result.data.parentMessageId).toBe("parent-1");
    }
  });

  it("rejects an unknown kind", () => {
    const result = createMessageInput.safeParse({
      taskId: "t1",
      content: "x",
      kind: "UNKNOWN",
    });
    expect(result.success).toBe(false);
  });

  it("normalizes empty payload and parentMessageId to undefined", () => {
    const result = createMessageInput.safeParse({
      taskId: "t1",
      content: "x",
      payload: "",
      parentMessageId: "   ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.payload).toBeUndefined();
      expect(result.data.parentMessageId).toBeUndefined();
    }
  });

  it("rejects a payload longer than 16000 characters", () => {
    const result = createMessageInput.safeParse({
      taskId: "t1",
      content: "x",
      payload: "x".repeat(16001),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from content", () => {
    const result = createMessageInput.safeParse({ taskId: "t1", content: "  hi  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.content).toBe("hi");
  });

  it("rejects an empty content", () => {
    const result = createMessageInput.safeParse({ taskId: "t1", content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only content", () => {
    const result = createMessageInput.safeParse({ taskId: "t1", content: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects content longer than 8000 characters", () => {
    const result = createMessageInput.safeParse({
      taskId: "t1",
      content: "x".repeat(8001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing taskId", () => {
    const result = createMessageInput.safeParse({ content: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty taskId", () => {
    const result = createMessageInput.safeParse({ taskId: "", content: "Hi" });
    expect(result.success).toBe(false);
  });

  it("accepts each valid role value", () => {
    for (const role of ["USER", "ASSISTANT", "SYSTEM"] as const) {
      const result = createMessageInput.safeParse({
        taskId: "t1",
        content: "Hi",
        role,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.role).toBe(role);
    }
  });

  it("rejects an unknown role value", () => {
    const result = createMessageInput.safeParse({
      taskId: "t1",
      content: "Hi",
      role: "ROBOT",
    });
    expect(result.success).toBe(false);
  });
});
