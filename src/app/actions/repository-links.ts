"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requestBootstrap } from "@/server/repository-links";
import type { RequestBootstrapActionState } from "./repository-links.state";

export async function requestBootstrapAction(
  prev: RequestBootstrapActionState,
  formData: FormData,
): Promise<RequestBootstrapActionState> {
  const raw = {
    projectId: formData.get("projectId"),
    owner: formData.get("owner"),
    name: formData.get("name"),
    // Unchecked checkboxes are omitted from FormData entirely, so a null
    // here means the user unchecked the "private" box.
    private: formData.get("private") === "true",
  };

  try {
    const link = await requestBootstrap(raw);
    revalidatePath(`/projects/${link.projectId}`);
    // The row is always persisted (even on FAILED) so the UI can read
    // link.status on the next render. We distinguish the action's return
    // contract: a persisted FAILED link is still "the action ran" — it
    // just persisted an error state. succeededAt increments either way so
    // the form resets and stops showing the previous inline error.
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
