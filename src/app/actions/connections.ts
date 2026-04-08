"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createConnection } from "@/server/connections";

export type CreateConnectionActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialCreateConnectionState: CreateConnectionActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};

export async function createConnectionAction(
  prev: CreateConnectionActionState,
  formData: FormData,
): Promise<CreateConnectionActionState> {
  const raw = {
    provider: formData.get("provider"),
    label: formData.get("label"),
  };

  try {
    await createConnection(raw);
    // Connections are workspace-level; revalidate the home route since
    // the LeftRail's "Provider connections" section lives there.
    revalidatePath("/");
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
    throw error;
  }
}
