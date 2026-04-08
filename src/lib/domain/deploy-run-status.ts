// SQLite does not support Prisma enums, so DeployRun.status is stored as
// a constrained string. This module is the single source of truth for
// the allowed values and the runtime validators.

export const DEPLOY_RUN_STATUSES = [
  "REQUESTED",
  "BUILDING",
  "DEPLOYING",
  "LIVE",
  "FAILED",
] as const;

export type DeployRunStatus = (typeof DEPLOY_RUN_STATUSES)[number];

export const DEPLOY_RUN_TERMINAL_STATUSES: readonly DeployRunStatus[] = [
  "LIVE",
  "FAILED",
];

export function isDeployRunStatus(value: unknown): value is DeployRunStatus {
  return (
    typeof value === "string" &&
    (DEPLOY_RUN_STATUSES as readonly string[]).includes(value)
  );
}

export function assertDeployRunStatus(value: string): DeployRunStatus {
  if (!isDeployRunStatus(value)) {
    throw new Error(`Invalid deploy run status persisted in DB: ${value}`);
  }
  return value;
}

export function isDeployRunTerminal(status: DeployRunStatus): boolean {
  return (DEPLOY_RUN_TERMINAL_STATUSES as readonly DeployRunStatus[]).includes(
    status,
  );
}
