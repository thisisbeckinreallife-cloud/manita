import { z } from "zod";
import { MESSAGE_ROLES } from "@/lib/domain/message-role";
import { MESSAGE_KINDS } from "@/lib/domain/message-kind";

// Normalize null / undefined / empty / whitespace strings to undefined
// BEFORE the inner validator runs. The .optional().or(z.literal("")
// .transform(...)) pattern does NOT work because .optional() accepts
// empty strings instead of routing them to .or — the reviewer caught
// this bug in earlier slices (0b, 4a).
function optionalString(max: number, message: string) {
  return z.preprocess(
    (value) => {
      if (value === null || value === undefined) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().max(max, message).optional(),
  );
}

export const createMessageInput = z.object({
  taskId: z.string().min(1, "taskId is required"),
  content: z
    .string()
    .trim()
    .min(1, "Message content is required")
    .max(8000, "Message must be 8000 characters or fewer"),
  role: z.enum(MESSAGE_ROLES).optional(),
  // Structured-message fields (slice 5a). All optional — existing
  // TEXT-only clients keep working without passing them.
  kind: z.enum(MESSAGE_KINDS).optional(),
  // JSON-serialized payload. The validator only enforces length; shape
  // validation per-kind is enforced by the consumer UI (try/catch
  // JSON.parse) since payload shapes evolve independently.
  payload: optionalString(16000, "Payload must be 16000 characters or fewer"),
  parentMessageId: optionalString(200, "parentMessageId must be 200 characters or fewer"),
});

export type CreateMessageInput = z.infer<typeof createMessageInput>;
