import { z } from "zod";
import { TASK_STATUSES } from "@/lib/domain/task-status";

export const createTaskInput = z.object({
  folderId: z.string().min(1, "folderId is required"),
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(120, "Task title must be 120 characters or fewer"),
  description: z.preprocess(
    (value) => {
      if (value === null || value === undefined) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .string()
      .max(2000, "Description must be 2000 characters or fewer")
      .optional(),
  ),
  status: z.enum(TASK_STATUSES).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskInput>;
