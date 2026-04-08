import { db } from "@/lib/db";
import { getRailwayAdapter, RailwayAdapterError } from "@/lib/railway";
import { requestDeployInput } from "@/lib/validation/deploy-run";
import {
  assertDeployRunStatus,
  isDeployRunTerminal,
  type DeployRunStatus,
} from "@/lib/domain/deploy-run-status";
import {
  assertDeployEventKind,
  type DeployEventKind,
} from "@/lib/domain/deploy-event-kind";

export type DeployRunRecord = {
  id: string;
  targetId: string;
  status: DeployRunStatus;
  commitSha: string | null;
  branch: string | null;
  externalId: string | null;
  requestedAt: Date;
  observedAt: Date | null;
  finishedAt: Date | null;
  errorCode: string | null;
  errorDetail: string | null;
};

export type DeployEventRecord = {
  id: string;
  runId: string;
  kind: DeployEventKind;
  message: string;
  payload: string | null;
  createdAt: Date;
};

export type CreatedDeployRun = DeployRunRecord & {
  events: DeployEventRecord[];
  projectId: string;
  previewUrl: string | null;
};

const SELECT_RUN = {
  id: true,
  targetId: true,
  status: true,
  commitSha: true,
  branch: true,
  externalId: true,
  requestedAt: true,
  observedAt: true,
  finishedAt: true,
  errorCode: true,
  errorDetail: true,
} as const;

const SELECT_EVENT = {
  id: true,
  runId: true,
  kind: true,
  message: true,
  payload: true,
  createdAt: true,
} as const;

function narrowRun(row: {
  id: string;
  targetId: string;
  status: string;
  commitSha: string | null;
  branch: string | null;
  externalId: string | null;
  requestedAt: Date;
  observedAt: Date | null;
  finishedAt: Date | null;
  errorCode: string | null;
  errorDetail: string | null;
}): DeployRunRecord {
  return { ...row, status: assertDeployRunStatus(row.status) };
}

function narrowEvent(row: {
  id: string;
  runId: string;
  kind: string;
  message: string;
  payload: string | null;
  createdAt: Date;
}): DeployEventRecord {
  return { ...row, kind: assertDeployEventKind(row.kind) };
}

export async function getLatestRunForProject(
  projectId: string,
): Promise<(DeployRunRecord & { events: DeployEventRecord[] }) | null> {
  const target = await db.deployTarget.findUnique({
    where: { projectId },
    select: { id: true },
  });
  if (!target) return null;
  const run = await db.deployRun.findFirst({
    where: { targetId: target.id },
    orderBy: { requestedAt: "desc" },
    select: {
      ...SELECT_RUN,
      events: {
        orderBy: { createdAt: "asc" },
        select: SELECT_EVENT,
      },
    },
  });
  if (!run) return null;
  return {
    ...narrowRun(run),
    events: run.events.map(narrowEvent),
  };
}

export async function getPreviewEndpointForProject(projectId: string): Promise<{
  url: string;
  observedAt: Date;
  lastRunId: string | null;
} | null> {
  const target = await db.deployTarget.findUnique({
    where: { projectId },
    select: { id: true },
  });
  if (!target) return null;
  const row = await db.previewEndpoint.findUnique({
    where: { targetId: target.id },
    select: { url: true, observedAt: true, lastRunId: true },
  });
  return row;
}

/**
 * Synchronous deploy flow. The adapter decides the terminal state in a
 * single round-trip; we persist every transition as an append-only event
 * and update the current preview endpoint only when the run reaches LIVE
 * with a non-null URL. Failed runs leave the prior preview untouched so
 * the UI can honestly label it "stale".
 */
export async function requestDeploy(rawInput: unknown): Promise<CreatedDeployRun> {
  const input = requestDeployInput.parse(rawInput);

  const target = await db.deployTarget.findUnique({
    where: { projectId: input.projectId },
    select: {
      id: true,
      projectId: true,
      railwayProjectId: true,
      railwayServiceId: true,
      railwayEnvironmentId: true,
    },
  });
  if (!target) {
    throw new Error("DEPLOY_TARGET_NOT_FOUND");
  }

  const run = await db.deployRun.create({
    data: {
      targetId: target.id,
      status: "REQUESTED",
      commitSha: input.commitSha ?? null,
      branch: input.branch ?? null,
    },
    select: SELECT_RUN,
  });
  await db.deployEvent.create({
    data: {
      runId: run.id,
      kind: "REQUESTED",
      message: `Deploy requested for ${target.railwayServiceId}`,
      payload: null,
    },
  });

  // Step 1: call the adapter. This is the only remote/fallible call.
  // We deliberately keep it OUTSIDE the DB write try/catch so a Prisma
  // failure cannot be mislabelled as a Railway failure.
  let adapterResult: Awaited<
    ReturnType<ReturnType<typeof getRailwayAdapter>["triggerDeploy"]>
  > | null = null;
  let adapterError: RailwayAdapterError | null = null;
  try {
    adapterResult = await getRailwayAdapter().triggerDeploy({
      railwayProjectId: target.railwayProjectId,
      railwayServiceId: target.railwayServiceId,
      railwayEnvironmentId: target.railwayEnvironmentId,
      commitSha: input.commitSha ?? null,
      branch: input.branch ?? null,
    });
  } catch (error) {
    if (error instanceof RailwayAdapterError) {
      adapterError = error;
    } else {
      // Non-RailwayAdapterError from the adapter layer — let it bubble
      // so the outer INTERNAL_ERROR branch labels it honestly.
      throw error;
    }
  }

  // Step 2: persist the terminal state in a transaction so the run row,
  // events, and preview endpoint stay mutually consistent. If any write
  // fails, Prisma rolls back and we fall through to the INTERNAL_ERROR
  // branch which marks the run as an internal failure (never a Railway
  // code).
  try {
    if (adapterError) {
      return await persistAdapterFailure({
        runId: run.id,
        targetProjectId: target.projectId,
        errorCode: adapterError.code,
        errorDetail: adapterError.detail,
      });
    }
    if (!adapterResult) {
      throw new Error("INTERNAL_ERROR: adapter returned no result");
    }
    return await persistAdapterSuccess({
      runId: run.id,
      targetId: target.id,
      targetProjectId: target.projectId,
      result: adapterResult,
    });
  } catch (error) {
    // Internal failure (Prisma write, constraint, etc.) — label it
    // INTERNAL_ERROR so the user sees an honest "something on our end"
    // instead of blaming Railway.
    return persistInternalFailure({
      runId: run.id,
      targetProjectId: target.projectId,
      error,
    });
  }
}

type AdapterResult = Awaited<
  ReturnType<ReturnType<typeof getRailwayAdapter>["triggerDeploy"]>
>;

async function persistAdapterSuccess(args: {
  runId: string;
  targetId: string;
  targetProjectId: string;
  result: AdapterResult;
}): Promise<CreatedDeployRun> {
  const { runId, targetId, targetProjectId, result } = args;
  const terminal = isDeployRunTerminal(result.status);
  const now = new Date();

  // Build the event batch with distinct createdAt timestamps so the UI
  // order is deterministic (createMany shares a single default).
  const events: Array<{
    runId: string;
    kind: DeployEventKind;
    message: string;
    payload: string | null;
    createdAt: Date;
  }> = result.logs.map((message, index) => ({
    runId,
    kind: "LOG",
    message,
    payload: null,
    createdAt: new Date(now.getTime() + index + 1),
  }));
  events.push({
    runId,
    kind: transitionKindFor(result.status),
    message: `Status now ${result.status}`,
    payload: JSON.stringify({
      from: "REQUESTED",
      to: result.status,
      externalId: result.externalId || null,
    }),
    createdAt: new Date(now.getTime() + result.logs.length + 1),
  });

  const updated = await db.$transaction(async (tx) => {
    const runRow = await tx.deployRun.update({
      where: { id: runId },
      data: {
        status: result.status,
        externalId: result.externalId || null,
        observedAt: now,
        finishedAt: terminal ? now : null,
        errorCode: null,
        errorDetail: null,
      },
      select: SELECT_RUN,
    });
    if (events.length > 0) {
      await tx.deployEvent.createMany({ data: events });
    }
    if (result.status === "LIVE" && result.previewUrl) {
      await tx.previewEndpoint.upsert({
        where: { targetId },
        create: {
          targetId,
          url: result.previewUrl,
          lastRunId: runRow.id,
        },
        update: {
          url: result.previewUrl,
          observedAt: now,
          lastRunId: runRow.id,
        },
      });
    }
    return runRow;
  });

  const persistedEvents = await db.deployEvent.findMany({
    where: { runId },
    orderBy: { createdAt: "asc" },
    select: SELECT_EVENT,
  });
  return {
    ...narrowRun(updated),
    events: persistedEvents.map(narrowEvent),
    projectId: targetProjectId,
    previewUrl: result.status === "LIVE" ? result.previewUrl : null,
  };
}

async function persistAdapterFailure(args: {
  runId: string;
  targetProjectId: string;
  errorCode: string;
  errorDetail: string | null;
}): Promise<CreatedDeployRun> {
  const { runId, targetProjectId, errorCode, errorDetail } = args;
  const now = new Date();
  const updated = await db.$transaction(async (tx) => {
    const runRow = await tx.deployRun.update({
      where: { id: runId },
      data: {
        status: "FAILED",
        observedAt: now,
        finishedAt: now,
        errorCode,
        errorDetail,
      },
      select: SELECT_RUN,
    });
    await tx.deployEvent.create({
      data: {
        runId,
        kind: "FAILED",
        message: errorCode,
        payload: errorDetail ? JSON.stringify({ detail: errorDetail }) : null,
      },
    });
    return runRow;
  });
  const persistedEvents = await db.deployEvent.findMany({
    where: { runId },
    orderBy: { createdAt: "asc" },
    select: SELECT_EVENT,
  });
  return {
    ...narrowRun(updated),
    events: persistedEvents.map(narrowEvent),
    projectId: targetProjectId,
    previewUrl: null,
  };
}

async function persistInternalFailure(args: {
  runId: string;
  targetProjectId: string;
  error: unknown;
}): Promise<CreatedDeployRun> {
  const { runId, targetProjectId, error } = args;
  const detail =
    error instanceof Error ? error.message : "Unknown internal error";
  const now = new Date();
  try {
    const updated = await db.deployRun.update({
      where: { id: runId },
      data: {
        status: "FAILED",
        observedAt: now,
        finishedAt: now,
        errorCode: "INTERNAL_ERROR",
        errorDetail: detail,
      },
      select: SELECT_RUN,
    });
    await db.deployEvent.create({
      data: {
        runId,
        kind: "FAILED",
        message: "INTERNAL_ERROR",
        payload: JSON.stringify({ detail }),
      },
    });
    const persistedEvents = await db.deployEvent.findMany({
      where: { runId },
      orderBy: { createdAt: "asc" },
      select: SELECT_EVENT,
    });
    return {
      ...narrowRun(updated),
      events: persistedEvents.map(narrowEvent),
      projectId: targetProjectId,
      previewUrl: null,
    };
  } catch {
    // DB is on fire. Re-throw the original error so the API layer
    // returns a 500 instead of persisting half-state.
    throw error;
  }
}

/**
 * Maps a terminal DeployRun status to the correct event kind so the
 * events list never paints a FAILED run green. The honesty contract
 * must hold even when the success path of the adapter returns a
 * terminal FAILED status (e.g., Railway reports "FAILED" on the
 * follow-up query).
 */
function transitionKindFor(status: DeployRunStatus): DeployEventKind {
  if (status === "FAILED") return "FAILED";
  if (status === "LIVE") return "FINISHED";
  return "STATUS_CHANGED";
}
