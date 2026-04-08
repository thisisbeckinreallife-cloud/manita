"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requestDeploy } from "@/server/deploy-runs";
import type { RequestDeployActionState } from "./deploy-runs.state";

export async function requestDeployAction(
  prev: RequestDeployActionState,
  formData: FormData,
): Promise<RequestDeployActionState> {
  const raw = {
    projectId: formData.get("projectId"),
    commitSha: formData.get("commitSha") || undefined,
    branch: formData.get("branch") || undefined,
  };

  try {
    const run = await requestDeploy(raw);
    revalidatePath(`/projects/${run.projectId}`);
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
    if (
      error instanceof Error &&
      error.message === "DEPLOY_TARGET_NOT_FOUND"
    ) {
      return {
        error: "Link a deploy target before triggering a deploy.",
        fieldErrors: null,
        succeededAt: prev.succeededAt,
      };
    }
    throw error;
  }
}
