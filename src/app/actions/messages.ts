"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createMessage } from "@/server/messages";
import type { CreateMessageActionState } from "./messages.state";

export async function createMessageAction(
  prev: CreateMessageActionState,
  formData: FormData,
): Promise<CreateMessageActionState> {
  const raw = {
    taskId: formData.get("taskId"),
    content: formData.get("content"),
  };

  try {
    const message = await createMessage(raw);
    revalidatePath(`/projects/${message.projectId}/tasks/${message.taskId}`);
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
    if (error instanceof Error && error.message === "TASK_NOT_FOUND") {
      return {
        error: "Task not found.",
        fieldErrors: null,
        succeededAt: prev.succeededAt,
      };
    }
    throw error;
  }
}
