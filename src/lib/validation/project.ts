import { z } from "zod";

export const createProjectInput = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(80, "Project name must be 80 characters or fewer"),
  description: z.preprocess(
    (value) => {
      if (value === null || value === undefined) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .string()
      .max(500, "Description must be 500 characters or fewer")
      .optional(),
  ),
});

export type CreateProjectInput = z.infer<typeof createProjectInput>;
