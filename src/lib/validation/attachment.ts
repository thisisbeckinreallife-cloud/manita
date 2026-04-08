import { z } from "zod";

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILENAME_LENGTH = 255;

export const createAttachmentMetadataInput = z.object({
  taskId: z.string().min(1, "taskId is required"),
  filename: z
    .string()
    .trim()
    .min(1, "Filename is required")
    .max(MAX_FILENAME_LENGTH, `Filename must be ${MAX_FILENAME_LENGTH} characters or fewer`),
  mimeType: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .transform((value) => value ?? "application/octet-stream"),
  sizeBytes: z
    .number()
    .int("Size must be an integer")
    .nonnegative("Size must be zero or positive")
    .max(MAX_ATTACHMENT_BYTES, "File exceeds the 10 MB limit"),
});

export type CreateAttachmentMetadataInput = z.infer<typeof createAttachmentMetadataInput>;
