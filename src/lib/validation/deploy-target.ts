import { z } from "zod";

// Railway identifiers are cuid-like strings. We keep the regex lenient
// (alphanumeric + dashes) because Railway's format could change and we
// do not want to break legitimate ids.
const RAILWAY_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export const linkDeployTargetInput = z.object({
  projectId: z.string().min(1, "projectId is required"),
  railwayProjectId: z
    .string()
    .trim()
    .min(1, "Railway project id is required")
    .regex(RAILWAY_ID_RE, "Invalid Railway project id"),
  railwayServiceId: z
    .string()
    .trim()
    .min(1, "Railway service id is required")
    .regex(RAILWAY_ID_RE, "Invalid Railway service id"),
  railwayEnvironmentId: z
    .string()
    .trim()
    .regex(RAILWAY_ID_RE, "Invalid Railway environment id")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type LinkDeployTargetInput = z.infer<typeof linkDeployTargetInput>;
