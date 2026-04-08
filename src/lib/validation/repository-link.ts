import { z } from "zod";

// GitHub's username/repo rules: start with alnum, contain alnum, hyphen,
// underscore, or dot, up to 39/100 chars. We mirror GitHub's constraints
// so the adapter call cannot be tricked into an invalid URL.
const GITHUB_OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const GITHUB_REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;

export const requestBootstrapInput = z.object({
  projectId: z.string().min(1, "projectId is required"),
  owner: z
    .string()
    .trim()
    .min(1, "Owner is required")
    .regex(GITHUB_OWNER_RE, "Owner must be a valid GitHub username or org"),
  name: z
    .string()
    .trim()
    .min(1, "Repository name is required")
    .regex(GITHUB_REPO_RE, "Repository name has invalid characters"),
  private: z.boolean().optional().default(true),
});

export type RequestBootstrapInput = z.infer<typeof requestBootstrapInput>;
