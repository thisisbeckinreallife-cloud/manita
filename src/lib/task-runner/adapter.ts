// Task runner adapter contract. Slice 4b shipped a dry-run stub. Slice 5c
// adds the real ProviderTaskRunner that builds the prompt from task +
// project metadata + message history and calls the provider adapter.
//
// A runner's job:
//   1. take the trigger input + snapshot context (provider/model from the
//      current ModelSelection, plus the message count at trigger time)
//   2. optionally produce an assistant message to persist
//   3. decide a terminal TaskRunStatus
//
// The server layer persists whatever comes back.

import type { TaskRunStatus } from "@/lib/domain/task-run-status";

export type RunTaskInput = {
  taskId: string;
  provider: string | null;
  model: string | null;
  messageCount: number;
};

// Slice 5c: runners may produce a single assistant message to persist
// alongside the terminal run state. TEXT-only for now; structured kinds
// (PLAN / TOOL_CALL / TOOL_RESULT) land when a runner actually needs them.
export type RunTaskAssistantMessage = {
  content: string;
};

export type RunTaskResult = {
  status: TaskRunStatus;
  logs: string[];
  assistantMessage: RunTaskAssistantMessage | null;
};

export type TaskRunnerErrorCode =
  | "TASK_NO_MODEL_SELECTED"
  | "TASK_PROVIDER_NOT_FOUND"
  | "ANTHROPIC_TOKEN_NOT_CONFIGURED"
  | "ANTHROPIC_UNAUTHORIZED"
  | "ANTHROPIC_RATE_LIMITED"
  | "ANTHROPIC_API_ERROR"
  | "PROVIDER_NOT_IMPLEMENTED"
  | "TASK_RUNNER_INTERNAL_ERROR";

export class TaskRunnerError extends Error {
  readonly code: TaskRunnerErrorCode;
  readonly detail: string | null;
  constructor(code: TaskRunnerErrorCode, detail: string | null = null) {
    super(code);
    this.name = "TaskRunnerError";
    this.code = code;
    this.detail = detail;
  }
}

export interface TaskRunnerAdapter {
  runTask(input: RunTaskInput): Promise<RunTaskResult>;
}
