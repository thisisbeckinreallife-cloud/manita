"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { setSelectionForTask } from "@/server/selections";

export type SetSelectionActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialSetSelectionState: SetSelectionActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};

export async function setSelectionAction(
  prev: SetSelectionActionState,
  formData: FormData,
): Promise<SetSelectionActionState> {
  // The ModelSelector UI sends a single `pair` field shaped like
  // "<provider>::<model>" so the dropdown can map 1:1 to options. We split
  // server-side via indexOf+slice (not split("::", 2)) so a model id that
  // ever contains "::" round-trips instead of getting silently truncated.
  const pairRaw = formData.get("pair");
  if (typeof pairRaw !== "string" || pairRaw === "") {
    return {
      error: "Pick a model before saving.",
      fieldErrors: null,
      succeededAt: prev.succeededAt,
    };
  }
  const sepIdx = pairRaw.indexOf("::");
  if (sepIdx < 0) {
    return {
      error: "Invalid model selection.",
      fieldErrors: null,
      succeededAt: prev.succeededAt,
    };
  }
  const provider = pairRaw.slice(0, sepIdx);
  const model = pairRaw.slice(sepIdx + 2);

  const raw = {
    taskId: formData.get("taskId"),
    provider,
    model,
    connectionId: formData.get("connectionId") || null,
  };

  try {
    const selection = await setSelectionForTask(raw);
    revalidatePath(
      `/projects/${selection.projectId}/tasks/${selection.taskId}`,
    );
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
      if (
        error.message === "CONNECTION_NOT_FOUND" ||
        error.message === "CONNECTION_PROVIDER_MISMATCH"
      ) {
        return {
          error: "The selected connection is invalid for this provider.",
          fieldErrors: null,
          succeededAt: prev.succeededAt,
        };
      }
    }
    throw error;
  }
}
