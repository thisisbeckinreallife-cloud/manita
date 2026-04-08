"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createAttachment } from "@/server/attachments";

export type CreateAttachmentActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  // Monotonic counter incremented on every successful upload so the
  // uploader form can reset its file input.
  succeededAt: number;
};

export const initialCreateAttachmentState: CreateAttachmentActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};

export async function createAttachmentAction(
  prev: CreateAttachmentActionState,
  formData: FormData,
): Promise<CreateAttachmentActionState> {
  const taskId = formData.get("taskId");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      error: "Pick a file before uploading.",
      fieldErrors: null,
      succeededAt: prev.succeededAt,
    };
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(await file.arrayBuffer());
  } catch {
    return {
      error: "Failed to read the selected file.",
      fieldErrors: null,
      succeededAt: prev.succeededAt,
    };
  }

  try {
    const attachment = await createAttachment({
      taskId,
      filename: file.name,
      mimeType: file.type || undefined,
      sizeBytes: bytes.byteLength,
      bytes,
    });
    revalidatePath(`/projects/${attachment.projectId}/tasks/${attachment.taskId}`);
    return {
      error: null,
      fieldErrors: null,
      succeededAt: prev.succeededAt + 1,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: error.flatten().fieldErrors,
        succeededAt: prev.succeededAt,
      };
    }
    if (error instanceof Error) {
      if (error.message === "TASK_NOT_FOUND") {
        return {
          error: "Task not found.",
          fieldErrors: null,
          succeededAt: prev.succeededAt,
        };
      }
      if (error.message === "FILE_TOO_LARGE") {
        return {
          error: "File exceeds the 10 MB limit.",
          fieldErrors: null,
          succeededAt: prev.succeededAt,
        };
      }
    }
    throw error;
  }
}
