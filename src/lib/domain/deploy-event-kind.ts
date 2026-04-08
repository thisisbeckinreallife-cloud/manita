// SQLite does not support Prisma enums, so DeployEvent.kind is stored as
// a constrained string. This module is the single source of truth.

export const DEPLOY_EVENT_KINDS = [
  "REQUESTED",
  "STATUS_CHANGED",
  "LOG",
  "FINISHED",
  "FAILED",
] as const;

export type DeployEventKind = (typeof DEPLOY_EVENT_KINDS)[number];

export function isDeployEventKind(value: unknown): value is DeployEventKind {
  return (
    typeof value === "string" &&
    (DEPLOY_EVENT_KINDS as readonly string[]).includes(value)
  );
}

export function assertDeployEventKind(value: string): DeployEventKind {
  if (!isDeployEventKind(value)) {
    throw new Error(`Invalid deploy event kind persisted in DB: ${value}`);
  }
  return value;
}
