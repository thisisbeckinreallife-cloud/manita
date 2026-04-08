import { z } from "zod";

const SHA_RE = /^[0-9a-f]{7,40}$/i;
const BRANCH_RE = /^[A-Za-z0-9._/-]{1,120}$/;

export const requestDeployInput = z.object({
  projectId: z.string().min(1, "projectId is required"),
  commitSha: z
    .string()
    .trim()
    .regex(SHA_RE, "commitSha must be a 7-40 char hex string")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  branch: z
    .string()
    .trim()
    .regex(BRANCH_RE, "branch has invalid characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type RequestDeployInput = z.infer<typeof requestDeployInput>;
