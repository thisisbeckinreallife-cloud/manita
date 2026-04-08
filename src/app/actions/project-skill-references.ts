"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createProjectSkillReference } from "@/server/project-skill-references";
import type { CreateProjectSkillReferenceActionState } from "./project-skill-references.state";

export async function createProjectSkillReferenceAction(
  prev: CreateProjectSkillReferenceActionState,
  formData: FormData,
): Promise<CreateProjectSkillReferenceActionState> {
  const raw = {
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    source: formData.get("source") || undefined,
  };
  try {
    const skillRef = await createProjectSkillReference(raw);
    revalidatePath(`/projects/${skillRef.projectId}`);
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
