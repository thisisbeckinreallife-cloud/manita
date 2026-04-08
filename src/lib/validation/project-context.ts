import { z } from "zod";

export const createProjectContextInput = z.object({
  projectId: z.string().min(1, "projectId is required"),
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(120, "Label must be 120 characters or fewer"),
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(8000, "Content must be 8000 characters or fewer"),
});

export type CreateProjectContextInput = z.infer<typeof createProjectContextInput>;
