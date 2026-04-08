import { db } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import {
  MAX_ATTACHMENT_BYTES,
  createAttachmentMetadataInput,
} from "@/lib/validation/attachment";

export type AttachmentRecord = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  taskId: string;
  createdAt: Date;
};

export type CreatedAttachment = AttachmentRecord & { projectId: string };

const SELECT_ATTACHMENT = {
  id: true,
  filename: true,
  mimeType: true,
  sizeBytes: true,
  taskId: true,
  createdAt: true,
} as const;

export async function listAttachmentsForTask(
  taskId: string,
): Promise<AttachmentRecord[]> {
  return db.taskAttachment.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    select: SELECT_ATTACHMENT,
  });
}

/**
 * Persist the bytes via the storage adapter, then write the row in Prisma.
 * If the DB write fails after the bytes have been persisted, the orphaned
 * blob is rolled back via storage.delete(); errors during rollback are
 * swallowed (the task is already failing the user's request).
 */
export async function createAttachment(input: {
  taskId: unknown;
  filename: unknown;
  mimeType: unknown;
  sizeBytes: unknown;
  bytes: Buffer;
}): Promise<CreatedAttachment> {
  if (input.bytes.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const meta = createAttachmentMetadataInput.parse({
    taskId: input.taskId,
    filename: input.filename,
    mimeType: input.mimeType,
    sizeBytes: input.bytes.byteLength,
  });

  const task = await db.task.findUnique({
    where: { id: meta.taskId },
    select: { id: true, folder: { select: { projectId: true } } },
  });
  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  const storage = getStorage();
  const { key } = await storage.put(input.bytes);

  try {
    const created = await db.taskAttachment.create({
      data: {
        taskId: meta.taskId,
        filename: meta.filename,
        mimeType: meta.mimeType,
        sizeBytes: meta.sizeBytes,
        storageKey: key,
      },
      select: SELECT_ATTACHMENT,
    });
    return { ...created, projectId: task.folder.projectId };
  } catch (error) {
    // Best-effort orphan cleanup; storage errors here are not surfaced
    // because the original DB error is what the caller needs to see.
    try {
      await storage.delete(key);
    } catch {
      /* swallow */
    }
    throw error;
  }
}

export async function getAttachmentForDownload(
  id: string,
): Promise<{ record: AttachmentRecord; bytes: Buffer; storageKey: string } | null> {
  const row = await db.taskAttachment.findUnique({
    where: { id },
    select: { ...SELECT_ATTACHMENT, storageKey: true },
  });
  if (!row) return null;
  const { storageKey, ...record } = row;
  const bytes = await getStorage().read(storageKey);
  return { record, bytes, storageKey };
}
