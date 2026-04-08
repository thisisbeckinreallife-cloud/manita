import { db } from "@/lib/db";
import { createTaskInput } from "@/lib/validation/task";
import { isTaskStatus, type TaskStatus } from "@/lib/domain/task-status";

export type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  folderId: string;
  updatedAt: Date;
};

export type CreatedTask = TaskRecord & { projectId: string };

/**
 * Narrow a raw DB string into the TaskStatus union. Throws if the value is
 * unknown — corrupt DB state should fail loudly rather than silently
 * masquerade as OPEN. SQLite has no CHECK constraint, so this is the only
 * runtime guard between the DB and the rest of the app.
 */
function assertTaskStatus(value: string): TaskStatus {
  if (!isTaskStatus(value)) {
    throw new Error(`Invalid task status persisted in DB: ${value}`);
  }
  return value;
}

export async function listTasksForFolder(folderId: string): Promise<TaskRecord[]> {
  const rows = await db.task.findMany({
    where: { folderId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      folderId: true,
      updatedAt: true,
    },
  });
  return rows.map((row) => ({ ...row, status: assertTaskStatus(row.status) }));
}

export async function getTask(id: string): Promise<TaskRecord | null> {
  const row = await db.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      folderId: true,
      updatedAt: true,
    },
  });
  if (!row) return null;
  return { ...row, status: assertTaskStatus(row.status) };
}

export async function createTask(rawInput: unknown): Promise<CreatedTask> {
  const input = createTaskInput.parse(rawInput);
  const folder = await db.folder.findUnique({
    where: { id: input.folderId },
    select: { id: true, projectId: true },
  });
  if (!folder) {
    throw new Error("FOLDER_NOT_FOUND");
  }
  const created = await db.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status ?? "OPEN",
      folderId: input.folderId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      folderId: true,
      updatedAt: true,
    },
  });
  return {
    ...created,
    status: assertTaskStatus(created.status),
    projectId: folder.projectId,
  };
}
