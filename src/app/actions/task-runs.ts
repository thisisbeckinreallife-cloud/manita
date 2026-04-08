"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requestTaskRun } from "@/server/task-runs";
import type { RequestTaskRunActionState } from "./task-runs.state";

export async function requestTaskRunAction(
  prev: RequestTaskRunActionState,
  formData: FormData,
): Promise<RequestTaskRunActionState> {
  const raw = {
    taskId: formData.get("taskId"),
  };

  try {
    const run = await requestTaskRun(raw);
    revalidatePath(`/projects/${run.projectId}/tasks/${run.taskId}`);
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
