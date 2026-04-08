import { db } from "@/lib/db";
import { getTaskRunnerAdapter, TaskRunnerError } from "@/lib/task-runner";
import { requestTaskRunInput } from "@/lib/validation/task-run";
import {
  assertTaskRunStatus,
  type TaskRunStatus,
} from "@/lib/domain/task-run-status";

export type TaskRunRecord = {
  id: string;
  taskId: string;
  status: TaskRunStatus;
  provider: string | null;
  model: string | null;
  messageCount: number;
  requestedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  errorCode: string | null;
  errorDetail: string | null;
};

export type CreatedTaskRun = TaskRunRecord & { projectId: string };

const SELECT_RUN = {
  id: true,
  taskId: true,
  status: true,
  provider: true,
  model: true,
  messageCount: true,
  requestedAt: true,
  startedAt: true,
  finishedAt: true,
  errorCode: true,
  errorDetail: true,
} as const;

function narrow(row: {
  id: string;
  taskId: string;
  status: string;
  provider: string | null;
  model: string | null;
  messageCount: number;
  requestedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  errorCode: string | null;
  errorDetail: string | null;
}): TaskRunRecord {
  return { ...row, status: assertTaskRunStatus(row.status) };
}

export async function listRunsForTask(
  taskId: string,
  limit = 5,
): Promise<TaskRunRecord[]> {
  const rows = await db.taskRun.findMany({
    where: { taskId },
    orderBy: { requestedAt: "desc" },
    take: limit,
    select: SELECT_RUN,
  });
  return rows.map(narrow);
}

/**
 * Synchronous request-run flow mirroring the slice-3 deploy pattern.
 * Splits adapter call from DB phase so Prisma errors cannot be
 * mislabelled as runner errors.
 */
export async function requestTaskRun(rawInput: unknown): Promise<CreatedTaskRun> {
  const input = requestTaskRunInput.parse(rawInput);

  const task = await db.task.findUnique({
    where: { id: input.taskId },
    select: { id: true, folder: { select: { projectId: true } } },
  });
  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  // Snapshot the current model selection and message count at trigger
  // time. Both are captured into the new row BEFORE the adapter runs so
  // they survive a FAILED outcome.
  const [latestSelection, messageCount] = await Promise.all([
    db.modelSelectionSnapshot.findFirst({
      where: { taskId: input.taskId },
      orderBy: { takenAt: "desc" },
      select: { provider: true, model: true },
    }),
    db.taskMessage.count({ where: { taskId: input.taskId } }),
  ]);

  const initialRow = await db.taskRun.create({
    data: {
      taskId: input.taskId,
      status: "REQUESTED",
      provider: latestSelection?.provider ?? null,
      model: latestSelection?.model ?? null,
      messageCount,
    },
    select: SELECT_RUN,
  });

  // Phase 1: call the runner. Only TaskRunnerError is captured; anything
  // else re-throws so the DB-phase catch labels it INTERNAL_ERROR.
  let runnerError: TaskRunnerError | null = null;
  let runnerResult: Awaited<
    ReturnType<ReturnType<typeof getTaskRunnerAdapter>["runTask"]>
  > | null = null;
  try {
    runnerResult = await getTaskRunnerAdapter().runTask({
      taskId: input.taskId,
      provider: latestSelection?.provider ?? null,
      model: latestSelection?.model ?? null,
      messageCount,
    });
  } catch (error) {
    if (error instanceof TaskRunnerError) {
      runnerError = error;
    } else {
      throw error;
    }
  }

  // Phase 2: persist the terminal state.
  try {
    if (runnerError) {
      return await persistRunnerFailure({
        runId: initialRow.id,
        targetProjectId: task.folder.projectId,
        errorCode: runnerError.code,
        errorDetail: runnerError.detail,
      });
    }
    if (!runnerResult) {
      throw new Error("INTERNAL_ERROR: runner returned no result");
    }
    return await persistRunnerSuccess({
      runId: initialRow.id,
      targetProjectId: task.folder.projectId,
      status: runnerResult.status,
    });
  } catch (error) {
    return persistInternalFailure({
      runId: initialRow.id,
      targetProjectId: task.folder.projectId,
      error,
    });
  }
}

async function persistRunnerSuccess(args: {
  runId: string;
  targetProjectId: string;
  status: TaskRunStatus;
}): Promise<CreatedTaskRun> {
  const { runId, targetProjectId, status } = args;
  const now = new Date();
  // The stub runner is synchronous, so the terminal state is reached in
  // one tick. startedAt/finishedAt are set together.
  const updated = await db.taskRun.update({
    where: { id: runId },
    data: {
      status,
      startedAt: now,
      finishedAt: now,
      errorCode: null,
      errorDetail: null,
    },
    select: SELECT_RUN,
  });
  return { ...narrow(updated), projectId: targetProjectId };
}

async function persistRunnerFailure(args: {
  runId: string;
  targetProjectId: string;
  errorCode: string;
  errorDetail: string | null;
}): Promise<CreatedTaskRun> {
  const { runId, targetProjectId, errorCode, errorDetail } = args;
  const now = new Date();
  const updated = await db.taskRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      startedAt: now,
      finishedAt: now,
      errorCode,
      errorDetail,
    },
    select: SELECT_RUN,
  });
  return { ...narrow(updated), projectId: targetProjectId };
}

async function persistInternalFailure(args: {
  runId: string;
  targetProjectId: string;
  error: unknown;
}): Promise<CreatedTaskRun> {
  const { runId, targetProjectId, error } = args;
  const detail =
    error instanceof Error ? error.message : "Unknown internal error";
  const now = new Date();
  try {
    const updated = await db.taskRun.update({
      where: { id: runId },
      data: {
        status: "FAILED",
        startedAt: now,
        finishedAt: now,
        errorCode: "INTERNAL_ERROR",
        errorDetail: detail,
      },
      select: SELECT_RUN,
    });
    return { ...narrow(updated), projectId: targetProjectId };
  } catch {
    throw error;
  }
}
