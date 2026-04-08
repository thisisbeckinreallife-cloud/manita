"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createProjectRule } from "@/server/project-rules";
import type { CreateProjectRuleActionState } from "./project-rules.state";

export async function createProjectRuleAction(
  prev: CreateProjectRuleActionState,
  formData: FormData,
): Promise<CreateProjectRuleActionState> {
  const raw = {
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    body: formData.get("body"),
  };
  try {
    const rule = await createProjectRule(raw);
    revalidatePath(`/projects/${rule.projectId}`);
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
