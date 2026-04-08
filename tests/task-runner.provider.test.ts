import { afterEach, describe, expect, it } from "vitest";
import {
  ProviderTaskRunner,
  buildSystemPrompt,
  mapMessagesToProvider,
  type LoadedTaskContext,
} from "@/lib/task-runner/provider-runner";
import { TaskRunnerError } from "@/lib/task-runner/adapter";
import { FakeAnthropicClient } from "@/lib/providers/anthropic-fake";
import { setAnthropicClient } from "@/lib/providers/anthropic";

function baseContext(overrides: Partial<LoadedTaskContext> = {}): LoadedTaskContext {
  return {
    task: { title: "Ship smoke test", description: null },
    rules: [],
    contexts: [],
    skillRefs: [],
    messages: [],
    ...overrides,
  };
}

function loaderFor(context: LoadedTaskContext) {
  return async () => context;
}

describe("buildSystemPrompt", () => {
  it("always emits the task heading and the closing instruction", () => {
    const prompt = buildSystemPrompt(baseContext());
    expect(prompt).toContain("# Task: Ship smoke test");
    expect(prompt).toContain("Respond concisely");
  });

  it("inlines the task description when present and trimmed", () => {
    const prompt = buildSystemPrompt(
      baseContext({ task: { title: "T", description: "  do the thing  " } }),
    );
    expect(prompt).toContain("do the thing");
    // The description should be trimmed.
    expect(prompt).not.toContain("  do the thing  ");
  });

  it("skips the description section entirely when empty or whitespace", () => {
    const prompt = buildSystemPrompt(
      baseContext({ task: { title: "T", description: "   " } }),
    );
    const lines = prompt.split("\n\n");
    // Section 0: "# Task: T"
    // Section 1 should be the closing instruction, NOT the description.
    expect(lines[1]).toContain("Respond concisely");
  });

  it("emits project rules as a bulleted list", () => {
    const prompt = buildSystemPrompt(
      baseContext({
        rules: [
          { title: "Be honest", body: "No fake states." },
          { title: "Minimal diff", body: "No opportunistic refactors." },
        ],
      }),
    );
    expect(prompt).toContain("## Project rules");
    expect(prompt).toContain("- **Be honest**: No fake states.");
    expect(prompt).toContain("- **Minimal diff**: No opportunistic refactors.");
  });

  it("emits project contexts with their labels as subheadings", () => {
    const prompt = buildSystemPrompt(
      baseContext({
        contexts: [{ label: "Target users", content: "Senior operators." }],
      }),
    );
    expect(prompt).toContain("## Project context");
    expect(prompt).toContain("### Target users");
    expect(prompt).toContain("Senior operators.");
  });

  it("emits skill references with optional source annotation", () => {
    const prompt = buildSystemPrompt(
      baseContext({
        skillRefs: [
          { name: "ui-workspace-standards", source: ".claude/skills" },
          { name: "repo-safety", source: null },
        ],
      }),
    );
    expect(prompt).toContain("## Referenced skills");
    expect(prompt).toContain("- ui-workspace-standards (.claude/skills)");
    expect(prompt).toContain("- repo-safety");
  });

  it("omits rules/contexts/skills sections when all are empty", () => {
    const prompt = buildSystemPrompt(baseContext());
    expect(prompt).not.toContain("## Project rules");
    expect(prompt).not.toContain("## Project context");
    expect(prompt).not.toContain("## Referenced skills");
  });
});

describe("mapMessagesToProvider", () => {
  it("forwards only TEXT-kind USER/ASSISTANT messages", () => {
    const out = mapMessagesToProvider([
      { role: "USER", kind: "TEXT", content: "hi" },
      { role: "ASSISTANT", kind: "TEXT", content: "hello" },
      { role: "USER", kind: "TOOL_CALL", content: "tool" },
      { role: "ASSISTANT", kind: "TOOL_RESULT", content: "result" },
      { role: "ASSISTANT", kind: "PLAN", content: "plan" },
      { role: "SYSTEM", kind: "TEXT", content: "sys" },
      { role: "USER", kind: "TEXT", content: "again" },
    ]);
    expect(out).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
      { role: "user", content: "again" },
    ]);
  });

  it("returns an empty array for an empty message history", () => {
    expect(mapMessagesToProvider([])).toEqual([]);
  });
});

describe("ProviderTaskRunner", () => {
  afterEach(() => {
    // Reset the module-level anthropic client so tests cannot bleed.
    setAnthropicClient(null);
  });

  it("throws TASK_NO_MODEL_SELECTED when provider is null", async () => {
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    await expect(
      runner.runTask({ taskId: "t1", provider: null, model: "claude-sonnet-4-6", messageCount: 0 }),
    ).rejects.toMatchObject({ code: "TASK_NO_MODEL_SELECTED" });
  });

  it("throws TASK_NO_MODEL_SELECTED when model is null", async () => {
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    await expect(
      runner.runTask({ taskId: "t1", provider: "anthropic", model: null, messageCount: 0 }),
    ).rejects.toMatchObject({ code: "TASK_NO_MODEL_SELECTED" });
  });

  it("throws TASK_PROVIDER_NOT_FOUND for an unknown provider id", async () => {
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    await expect(
      runner.runTask({ taskId: "t1", provider: "nope", model: "x", messageCount: 0 }),
    ).rejects.toMatchObject({ code: "TASK_PROVIDER_NOT_FOUND" });
  });

  it("returns DONE + assistantMessage on happy path and forwards the prompt", async () => {
    const client = new FakeAnthropicClient({ replyText: "sure, here is the plan" });
    setAnthropicClient(client);
    const runner = new ProviderTaskRunner(
      loaderFor(
        baseContext({
          task: { title: "Ship smoke test", description: "end to end" },
          rules: [{ title: "Be honest", body: "No fakes." }],
          messages: [
            { role: "USER", kind: "TEXT", content: "what's next?" },
          ],
        }),
      ),
    );

    const result = await runner.runTask({
      taskId: "t1",
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      messageCount: 1,
    });

    expect(result.status).toBe("DONE");
    expect(result.assistantMessage?.content).toBe("sure, here is the plan");
    expect(result.logs.join(" ")).toContain("anthropic/claude-sonnet-4-6");
    expect(result.logs.join(" ")).toContain("stop_reason=end_turn");

    expect(client.calls).toHaveLength(1);
    const call = client.calls[0]!;
    expect(call.model).toBe("claude-sonnet-4-6");
    expect(call.maxTokens).toBe(4096);
    expect(call.systemPrompt).toContain("# Task: Ship smoke test");
    expect(call.systemPrompt).toContain("end to end");
    expect(call.systemPrompt).toContain("- **Be honest**: No fakes.");
    expect(call.messages).toEqual([{ role: "user", content: "what's next?" }]);
  });

  it("returns DONE with assistantMessage=null when the reply is whitespace only", async () => {
    setAnthropicClient(new FakeAnthropicClient({ replyText: "   \n  " }));
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    const result = await runner.runTask({
      taskId: "t1",
      provider: "anthropic",
      model: "claude-sonnet-4-6",
      messageCount: 0,
    });
    expect(result.status).toBe("DONE");
    expect(result.assistantMessage).toBeNull();
  });

  it("maps PROVIDER_TOKEN_NOT_CONFIGURED to ANTHROPIC_TOKEN_NOT_CONFIGURED", async () => {
    setAnthropicClient(
      new FakeAnthropicClient({ failWith: "PROVIDER_TOKEN_NOT_CONFIGURED" }),
    );
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    await expect(
      runner.runTask({
        taskId: "t1",
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        messageCount: 0,
      }),
    ).rejects.toMatchObject({
      name: "TaskRunnerError",
      code: "ANTHROPIC_TOKEN_NOT_CONFIGURED",
    });
  });

  it("maps PROVIDER_UNAUTHORIZED to ANTHROPIC_UNAUTHORIZED", async () => {
    setAnthropicClient(new FakeAnthropicClient({ failWith: "PROVIDER_UNAUTHORIZED" }));
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    await expect(
      runner.runTask({
        taskId: "t1",
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        messageCount: 0,
      }),
    ).rejects.toMatchObject({ code: "ANTHROPIC_UNAUTHORIZED" });
  });

  it("maps PROVIDER_RATE_LIMITED to ANTHROPIC_RATE_LIMITED", async () => {
    setAnthropicClient(new FakeAnthropicClient({ failWith: "PROVIDER_RATE_LIMITED" }));
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    await expect(
      runner.runTask({
        taskId: "t1",
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        messageCount: 0,
      }),
    ).rejects.toMatchObject({ code: "ANTHROPIC_RATE_LIMITED" });
  });

  it("maps PROVIDER_API_ERROR to ANTHROPIC_API_ERROR", async () => {
    setAnthropicClient(new FakeAnthropicClient({ failWith: "PROVIDER_API_ERROR" }));
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    await expect(
      runner.runTask({
        taskId: "t1",
        provider: "anthropic",
        model: "claude-sonnet-4-6",
        messageCount: 0,
      }),
    ).rejects.toMatchObject({ code: "ANTHROPIC_API_ERROR" });
  });

  it("maps openai PROVIDER_NOT_IMPLEMENTED to PROVIDER_NOT_IMPLEMENTED", async () => {
    // openai's real adapter throws PROVIDER_NOT_IMPLEMENTED when .complete
    // is called. No injection needed — the registry picks the real adapter.
    const runner = new ProviderTaskRunner(loaderFor(baseContext()));
    const err = await runner
      .runTask({
        taskId: "t1",
        provider: "openai",
        model: "gpt-5",
        messageCount: 0,
      })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TaskRunnerError);
    expect((err as TaskRunnerError).code).toBe("PROVIDER_NOT_IMPLEMENTED");
  });
});
