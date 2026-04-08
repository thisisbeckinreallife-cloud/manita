import { db } from "@/lib/db";
import { getProviderAdapter } from "@/lib/providers/registry";
import {
  ProviderError,
  type ProviderCompleteMessage,
  type ProviderErrorCode,
} from "@/lib/providers/adapter";
import {
  TaskRunnerError,
  type RunTaskInput,
  type RunTaskResult,
  type TaskRunnerAdapter,
  type TaskRunnerErrorCode,
} from "./adapter";

// Default maximum output tokens for a batch completion. Kept
// conservative for MVP — streaming + user-configurable limits land
// in a later slice.
const DEFAULT_MAX_TOKENS = 4096;

// Only "anthropic" has a real implementation today; "openai" throws
// PROVIDER_NOT_IMPLEMENTED from its adapter.
const IMPLEMENTED_PROVIDER_ID = "anthropic";

export type LoadedTaskContext = {
  task: { title: string; description: string | null };
  rules: Array<{ title: string; body: string }>;
  contexts: Array<{ label: string; content: string }>;
  skillRefs: Array<{ name: string; source: string | null }>;
  messages: Array<{ role: string; kind: string; content: string }>;
};

export type TaskContextLoader = (taskId: string) => Promise<LoadedTaskContext>;

/**
 * Real task runner. Builds the system prompt from the task + the
 * project's rules, contexts, and skill references, maps the task's
 * TEXT message history to provider-shaped messages, and calls the
 * provider's `complete` method.
 *
 * Only `TEXT`-kind messages are forwarded to the provider. The
 * structured kinds (`PLAN`, `TOOL_CALL`, `TOOL_RESULT`) shipped in
 * slice 5a are for future tooling work and have no meaning in a batch
 * completion today.
 *
 * All provider errors are translated into TaskRunnerError so the
 * server layer can persist a FAILED row and the UI can render it
 * honestly. No network retries — the request/response is synchronous
 * and the user can re-click "Run task" to retry.
 *
 * DB access is done through an injectable context loader so tests can
 * exercise the runner without mocking the database layer.
 */
export class ProviderTaskRunner implements TaskRunnerAdapter {
  private readonly loadContext: TaskContextLoader;

  constructor(loadContext: TaskContextLoader = defaultContextLoader) {
    this.loadContext = loadContext;
  }

  async runTask(input: RunTaskInput): Promise<RunTaskResult> {
    if (!input.provider || !input.model) {
      throw new TaskRunnerError(
        "TASK_NO_MODEL_SELECTED",
        "Pick a provider/model on the task before requesting a run.",
      );
    }

    const adapter = getProviderAdapter(input.provider);
    if (!adapter) {
      throw new TaskRunnerError(
        "TASK_PROVIDER_NOT_FOUND",
        `No provider adapter registered for "${input.provider}".`,
      );
    }

    const context = await this.loadContext(input.taskId);
    const systemPrompt = buildSystemPrompt(context);
    const messages = mapMessagesToProvider(context.messages);

    try {
      const result = await adapter.complete({
        model: input.model,
        systemPrompt,
        messages,
        maxTokens: DEFAULT_MAX_TOKENS,
      });
      const trimmed = result.text.trim();
      return {
        status: "DONE",
        logs: [
          `provider runner: ${input.provider}/${input.model}`,
          `provider runner: ${messages.length} message(s) forwarded`,
          `provider runner: stop_reason=${result.stopReason ?? "unknown"}`,
        ],
        assistantMessage: trimmed.length > 0 ? { content: trimmed } : null,
      };
    } catch (error) {
      if (error instanceof ProviderError) {
        throw new TaskRunnerError(
          mapProviderErrorCode(error.code, input.provider),
          error.detail,
        );
      }
      throw error;
    }
  }
}

async function defaultContextLoader(taskId: string): Promise<LoadedTaskContext> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      title: true,
      description: true,
      folder: { select: { projectId: true } },
    },
  });
  if (!task) {
    // The server layer has already validated the task exists before
    // calling the runner, so this should be unreachable in practice.
    // Surfacing it as INTERNAL_ERROR keeps the runner honest if the
    // contract ever drifts.
    throw new TaskRunnerError(
      "TASK_RUNNER_INTERNAL_ERROR",
      `Task ${taskId} disappeared between request and runner dispatch.`,
    );
  }
  const projectId = task.folder.projectId;

  const [rules, contexts, skillRefs, messages] = await Promise.all([
    db.projectRule.findMany({
      where: { projectId },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { title: true, body: true },
    }),
    db.projectContext.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" },
      select: { label: true, content: true },
    }),
    db.projectSkillReference.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      select: { name: true, source: true },
    }),
    db.taskMessage.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
      select: { role: true, kind: true, content: true },
    }),
  ]);

  return {
    task: { title: task.title, description: task.description },
    rules,
    contexts,
    skillRefs,
    messages,
  };
}

export function buildSystemPrompt(context: LoadedTaskContext): string {
  const sections: string[] = [];

  sections.push(`# Task: ${context.task.title}`);
  if (context.task.description && context.task.description.trim().length > 0) {
    sections.push(context.task.description.trim());
  }

  if (context.rules.length > 0) {
    const lines = ["## Project rules"];
    for (const rule of context.rules) {
      lines.push(`- **${rule.title}**: ${rule.body}`);
    }
    sections.push(lines.join("\n"));
  }

  if (context.contexts.length > 0) {
    const lines = ["## Project context"];
    for (const ctx of context.contexts) {
      lines.push(`### ${ctx.label}`);
      lines.push(ctx.content);
    }
    sections.push(lines.join("\n"));
  }

  if (context.skillRefs.length > 0) {
    const lines = ["## Referenced skills"];
    for (const ref of context.skillRefs) {
      lines.push(ref.source ? `- ${ref.name} (${ref.source})` : `- ${ref.name}`);
    }
    sections.push(lines.join("\n"));
  }

  sections.push(
    "Respond concisely to the latest user message in the conversation. Stay within the scope of the task above.",
  );

  return sections.join("\n\n");
}

export function mapMessagesToProvider(
  messages: Array<{ role: string; kind: string; content: string }>,
): ProviderCompleteMessage[] {
  const out: ProviderCompleteMessage[] = [];
  for (const message of messages) {
    if (message.kind !== "TEXT") continue;
    if (message.role === "USER") {
      out.push({ role: "user", content: message.content });
    } else if (message.role === "ASSISTANT") {
      out.push({ role: "assistant", content: message.content });
    }
    // SYSTEM-role messages are folded into the system prompt builder
    // today (none are produced yet), so we skip them here.
  }
  return out;
}

function mapProviderErrorCode(
  code: ProviderErrorCode,
  providerId: string,
): TaskRunnerErrorCode {
  if (providerId === IMPLEMENTED_PROVIDER_ID) {
    switch (code) {
      case "PROVIDER_TOKEN_NOT_CONFIGURED":
        return "ANTHROPIC_TOKEN_NOT_CONFIGURED";
      case "PROVIDER_UNAUTHORIZED":
        return "ANTHROPIC_UNAUTHORIZED";
      case "PROVIDER_RATE_LIMITED":
        return "ANTHROPIC_RATE_LIMITED";
      case "PROVIDER_API_ERROR":
        return "ANTHROPIC_API_ERROR";
      case "PROVIDER_NOT_IMPLEMENTED":
        return "PROVIDER_NOT_IMPLEMENTED";
    }
  }
  // Non-anthropic providers (e.g. openai) only reach here via
  // PROVIDER_NOT_IMPLEMENTED today, but we keep the fallthrough to
  // avoid a silent mislabel if a future provider surfaces a different
  // code before its runner-side mapping is added.
  if (code === "PROVIDER_NOT_IMPLEMENTED") return "PROVIDER_NOT_IMPLEMENTED";
  return "TASK_RUNNER_INTERNAL_ERROR";
}
