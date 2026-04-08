import { z } from "zod";

export const createProjectRuleInput = z.object({
  projectId: z.string().min(1, "projectId is required"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  body: z
    .string()
    .trim()
    .min(1, "Body is required")
    .max(4000, "Body must be 4000 characters or fewer"),
});

export type CreateProjectRuleInput = z.infer<typeof createProjectRuleInput>;
