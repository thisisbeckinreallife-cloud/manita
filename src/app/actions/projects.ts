"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createProject } from "@/server/projects";

export type CreateProjectActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
};

export async function createProjectAction(
  _prev: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> {
  const raw = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  try {
    const project = await createProject(raw);
    revalidatePath("/");
    redirect(`/projects/${project.id}`);
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: "Please fix the highlighted fields.",
        fieldErrors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}
