import { describe, expect, it } from "vitest";
import { requestTaskRunInput } from "@/lib/validation/task-run";

describe("requestTaskRunInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = requestTaskRunInput.safeParse({ taskId: "t1" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.taskId).toBe("t1");
  });

  it("rejects an empty taskId", () => {
    const result = requestTaskRunInput.safeParse({ taskId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing taskId", () => {
    const result = requestTaskRunInput.safeParse({});
    expect(result.success).toBe(false);
  });
});
