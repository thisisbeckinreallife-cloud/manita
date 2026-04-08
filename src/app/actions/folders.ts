"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createFolder } from "@/server/folders";

export type CreateFolderActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  // Monotonic counter incremented on every successful submission. The
  // client form watches this to reset its inputs after a create.
  succeededAt: number;
};

export const initialCreateFolderState: CreateFolderActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};

export async function createFolderAction(
  prev: CreateFolderActionState,
  formData: FormData,
): Promise<CreateFolderActionState> {
  const raw = {
    projectId: formData.get("projectId"),
    name: formData.get("name"),
  };

  try {
    const folder = await createFolder(raw);
    revalidatePath(`/projects/${folder.projectId}`);
    return { error: null, fieldErrors: null, succeededAt: prev.succeededAt + 1 };
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
