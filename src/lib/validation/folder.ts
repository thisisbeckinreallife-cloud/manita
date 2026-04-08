import { z } from "zod";

export const createFolderInput = z.object({
  projectId: z.string().min(1, "projectId is required"),
  name: z
    .string()
    .trim()
    .min(1, "Folder name is required")
    .max(80, "Folder name must be 80 characters or fewer"),
});

export type CreateFolderInput = z.infer<typeof createFolderInput>;
