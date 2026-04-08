import { z } from "zod";
import { PROVIDER_IDS } from "@/lib/domain/providers";

export const createConnectionInput = z.object({
  // Refined against the canonical catalog rather than z.enum so the
  // validator stays in sync with the source of truth in providers.ts.
  provider: z
    .string()
    .min(1, "Provider is required")
    .refine((value) => PROVIDER_IDS.includes(value), {
      message: "Unknown provider",
    }),
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(80, "Label must be 80 characters or fewer"),
});

export type CreateConnectionInput = z.infer<typeof createConnectionInput>;
