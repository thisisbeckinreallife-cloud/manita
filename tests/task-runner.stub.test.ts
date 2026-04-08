import { describe, expect, it } from "vitest";
import { StubTaskRunner } from "@/lib/task-runner/stub";
import { TaskRunnerError } from "@/lib/task-runner/adapter";

describe("StubTaskRunner", () => {
  it("returns DONE with descriptive logs when a model is selected", async () => {
    const runner = new StubTaskRunner();
    const result = await runner.runTask({
      taskId: "t1",
      provider: "anthropic",
      model: "claude-opus-4-6",
      messageCount: 3,
    });
    expect(result.status).toBe("DONE");
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.logs.join(" ")).toContain("anthropic/claude-opus-4-6");
    expect(result.logs.join(" ")).toContain("3 message");
    expect(runner.calls).toHaveLength(1);
  });

  it("throws TASK_NO_MODEL_SELECTED when provider is null", async () => {
    const runner = new StubTaskRunner();
    await expect(
      runner.runTask({
        taskId: "t1",
        provider: null,
        model: "claude-opus-4-6",
        messageCount: 0,
      }),
    ).rejects.toBeInstanceOf(TaskRunnerError);
  });

  it("throws TASK_NO_MODEL_SELECTED when model is null", async () => {
    const runner = new StubTaskRunner();
    try {
      await runner.runTask({
        taskId: "t1",
        provider: "anthropic",
        model: null,
        messageCount: 0,
      });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(TaskRunnerError);
      expect((error as TaskRunnerError).code).toBe("TASK_NO_MODEL_SELECTED");
    }
  });
});
