import { z } from "zod";
import { isKnownModel, isKnownProvider } from "@/lib/domain/providers";

// The provider/model pair must come from the catalog. We validate the pair
// jointly via .superRefine so the error attaches to the offending field
// instead of failing twice and confusing the form.
export const setSelectionInput = z
  .object({
    taskId: z.string().min(1, "taskId is required"),
    provider: z.string().min(1, "Provider is required"),
    model: z.string().min(1, "Model is required"),
    connectionId: z.string().nullish().transform((value) => value ?? null),
  })
  .superRefine((value, ctx) => {
    if (!isKnownProvider(value.provider)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["provider"],
        message: "Unknown provider",
      });
      return;
    }
    if (!isKnownModel(value.provider, value.model)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["model"],
        message: "Model is not in the provider catalog",
      });
    }
  });

export type SetSelectionInput = z.infer<typeof setSelectionInput>;
