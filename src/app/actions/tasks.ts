"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createTask } from "@/server/tasks";

export type CreateTaskActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
};

export async function createTaskAction(
  _prev: CreateTaskActionState,
  formData: FormData,
): Promise<CreateTaskActionState> {
  const raw = {
    folderId: formData.get("folderId"),
    title: formData.get("title"),
    description: formData.get("description"),
  };

  let projectId: string;
  try {
    const task = await createTask(raw);
    projectId = task.projectId;
    revalidatePath(`/projects/${projectId}`);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    if (error instanceof Error && error.message === "FOLDER_NOT_FOUND") {
      return { error: "Folder not found.", fieldErrors: null };
    }
    throw error;
  }

  // Outside the try/catch: Next's redirect() works by throwing, so it must
  // not be caught by our ZodError/FOLDER_NOT_FOUND handler.
  redirect(`/projects/${projectId}`);
}
