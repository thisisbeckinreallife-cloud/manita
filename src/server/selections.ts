import { db } from "@/lib/db";
import { setSelectionInput } from "@/lib/validation/selection";

export type SelectionRecord = {
  id: string;
  taskId: string;
  provider: string;
  model: string;
  connectionId: string | null;
  takenAt: Date;
};

export type CreatedSelection = SelectionRecord & { projectId: string };

const SELECT_SELECTION = {
  id: true,
  taskId: true,
  provider: true,
  model: true,
  connectionId: true,
  takenAt: true,
} as const;

/**
 * Returns the most recent (provider, model) snapshot for the given task,
 * or null if the user has not picked anything yet.
 */
export async function getCurrentSelectionForTask(
  taskId: string,
): Promise<SelectionRecord | null> {
  return db.modelSelectionSnapshot.findFirst({
    where: { taskId },
    orderBy: { takenAt: "desc" },
    select: SELECT_SELECTION,
  });
}

export async function setSelectionForTask(
  rawInput: unknown,
): Promise<CreatedSelection> {
  const input = setSelectionInput.parse(rawInput);

  const task = await db.task.findUnique({
    where: { id: input.taskId },
    select: { id: true, folder: { select: { projectId: true } } },
  });
  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (input.connectionId) {
    const connection = await db.modelProviderConnection.findUnique({
      where: { id: input.connectionId },
      select: { id: true, provider: true },
    });
    if (!connection) {
      throw new Error("CONNECTION_NOT_FOUND");
    }
    if (connection.provider !== input.provider) {
      throw new Error("CONNECTION_PROVIDER_MISMATCH");
    }
  }

  const created = await db.modelSelectionSnapshot.create({
    data: {
      taskId: input.taskId,
      provider: input.provider,
      model: input.model,
      connectionId: input.connectionId,
    },
    select: SELECT_SELECTION,
  });
  return { ...created, projectId: task.folder.projectId };
}
