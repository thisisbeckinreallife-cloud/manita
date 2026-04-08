"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createProjectContext } from "@/server/project-contexts";
import type { CreateProjectContextActionState } from "./project-contexts.state";

export async function createProjectContextAction(
  prev: CreateProjectContextActionState,
  formData: FormData,
): Promise<CreateProjectContextActionState> {
  const raw = {
    projectId: formData.get("projectId"),
    label: formData.get("label"),
    content: formData.get("content"),
  };
  try {
    const context = await createProjectContext(raw);
    revalidatePath(`/projects/${context.projectId}`);
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
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      return {
        error: "Project not found.",
        fieldErrors: null,
        succeededAt: prev.succeededAt,
      };
    }
    throw error;
  }
}
