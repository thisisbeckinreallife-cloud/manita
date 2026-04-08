// SQLite does not support Prisma enums, so TaskStatus is stored as a
// constrained string. This module is the single source of truth for the
// allowed values and the runtime validator.

export const TASK_STATUSES = ["OPEN", "IN_PROGRESS", "DONE", "ARCHIVED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (TASK_STATUSES as readonly string[]).includes(value);
}
