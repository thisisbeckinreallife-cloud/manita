// SQLite does not support Prisma enums, so RepositoryLink.status is stored
// as a constrained string. This module is the single source of truth for
// the allowed values and the runtime validators.

export const REPOSITORY_LINK_STATUSES = ["REQUESTED", "OBSERVED", "FAILED"] as const;
export type RepositoryLinkStatus = (typeof REPOSITORY_LINK_STATUSES)[number];

export function isRepositoryLinkStatus(value: unknown): value is RepositoryLinkStatus {
  return (
    typeof value === "string" &&
    (REPOSITORY_LINK_STATUSES as readonly string[]).includes(value)
  );
}

export function assertRepositoryLinkStatus(value: string): RepositoryLinkStatus {
  if (!isRepositoryLinkStatus(value)) {
    throw new Error(`Invalid repository link status persisted in DB: ${value}`);
  }
  return value;
}
