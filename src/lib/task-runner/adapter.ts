// Task runner adapter contract. Slice 4b ships a dry-run stub only —
// no real provider calls. The runner's job is to take the trigger input
// + snapshot context (provider/model from the current ModelSelection,
// plus the message count at trigger time) and decide a terminal state.
// The server layer persists whatever comes back.
//
// A real runner in a future slice will call the provider adapter from
// src/lib/providers/** and stream real messages. This interface is
// stable enough that the swap should not touch the server layer.

import type { TaskRunStatus } from "@/lib/domain/task-run-status";

export type RunTaskInput = {
  taskId: string;
  provider: string | null;
  model: string | null;
  messageCount: number;
};

export type RunTaskResult = {
  status: TaskRunStatus;
  logs: string[];
};

export type TaskRunnerErrorCode =
  | "TASK_NO_MODEL_SELECTED"
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
