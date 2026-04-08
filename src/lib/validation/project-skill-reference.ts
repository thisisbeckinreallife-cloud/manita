import { z } from "zod";

export const createProjectSkillReferenceInput = z.object({
  projectId: z.string().min(1, "projectId is required"),
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(120, "Name must be 120 characters or fewer"),
  // Same pattern as project.description and task.description: preprocess
  // normalizes null / undefined / empty string / whitespace-only to
  // undefined BEFORE the optional string validator runs. The chained
  // `.optional().or(z.literal(""))` pattern does NOT work because
  // `.optional()` accepts empty strings instead of routing them to `.or`.
  source: z.preprocess(
    (value) => {
      if (value === null || value === undefined) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .string()
      .max(500, "Source must be 500 characters or fewer")
      .optional(),
  ),
});

export type CreateProjectSkillReferenceInput = z.infer<
  typeof createProjectSkillReferenceInput
>;
