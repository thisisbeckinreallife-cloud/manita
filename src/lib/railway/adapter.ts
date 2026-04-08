// Railway adapter contract. Everything that touches railway.app's API
// lives under src/lib/railway/**. The rest of the app targets this
// interface so the implementation can be swapped for tests without
// mocking fetch.

import type { DeployRunStatus } from "@/lib/domain/deploy-run-status";

export type TriggerDeployInput = {
  railwayProjectId: string;
  railwayServiceId: string;
  railwayEnvironmentId: string | null;
  commitSha: string | null;
  branch: string | null;
};

export type TriggerDeployResult = {
  externalId: string;
  status: DeployRunStatus;
  previewUrl: string | null;
  // Optional adapter-level log lines the server can persist as events.
  logs: string[];
};

export type RailwayErrorCode =
  | "RAILWAY_TOKEN_NOT_CONFIGURED"
  | "RAILWAY_UNAUTHORIZED"
  | "RAILWAY_FORBIDDEN"
  | "RAILWAY_NOT_FOUND"
  | "RAILWAY_VALIDATION_FAILED"
  | "RAILWAY_UNKNOWN_ERROR";

export class RailwayAdapterError extends Error {
  readonly code: RailwayErrorCode;
  readonly detail: string | null;
  readonly status: number | null;
  constructor(
    code: RailwayErrorCode,
    detail: string | null = null,
    status: number | null = null,
  ) {
    super(code);
    this.name = "RailwayAdapterError";
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

export interface RailwayAdapter {
  triggerDeploy(input: TriggerDeployInput): Promise<TriggerDeployResult>;
}
