"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { linkDeployTarget } from "@/server/deploy-targets";
import type { LinkDeployTargetActionState } from "./deploy-targets.state";

export async function linkDeployTargetAction(
  prev: LinkDeployTargetActionState,
  formData: FormData,
): Promise<LinkDeployTargetActionState> {
  const raw = {
    projectId: formData.get("projectId"),
    railwayProjectId: formData.get("railwayProjectId"),
    railwayServiceId: formData.get("railwayServiceId"),
    railwayEnvironmentId: formData.get("railwayEnvironmentId") || undefined,
  };

  try {
    const target = await linkDeployTarget(raw);
    revalidatePath(`/projects/${target.projectId}`);
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
