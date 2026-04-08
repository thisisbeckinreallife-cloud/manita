import { z } from "zod";
import { MESSAGE_ROLES } from "@/lib/domain/message-role";

export const createMessageInput = z.object({
  taskId: z.string().min(1, "taskId is required"),
  content: z
    .string()
    .trim()
    .min(1, "Message content is required")
    .max(8000, "Message must be 8000 characters or fewer"),
  role: z.enum(MESSAGE_ROLES).optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageInput>;
