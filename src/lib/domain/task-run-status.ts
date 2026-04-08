// SQLite does not support Prisma enums, so TaskRun.status is stored as a
// constrained string. Single source of truth for the allowed values and
// the runtime guards.

export const TASK_RUN_STATUSES = [
  "REQUESTED",
  "RUNNING",
  "DONE",
  "FAILED",
] as const;

export type TaskRunStatus = (typeof TASK_RUN_STATUSES)[number];

export const TASK_RUN_TERMINAL_STATUSES: readonly TaskRunStatus[] = [
  "DONE",
  "FAILED",
];

export function isTaskRunStatus(value: unknown): value is TaskRunStatus {
  return (
    typeof value === "string" &&
    (TASK_RUN_STATUSES as readonly string[]).includes(value)
  );
}

export function assertTaskRunStatus(value: string): TaskRunStatus {
  if (!isTaskRunStatus(value)) {
    throw new Error(`Invalid task run status persisted in DB: ${value}`);
  }
  return value;
}

export function isTaskRunTerminal(status: TaskRunStatus): boolean {
  return (TASK_RUN_TERMINAL_STATUSES as readonly TaskRunStatus[]).includes(
    status,
  );
}
