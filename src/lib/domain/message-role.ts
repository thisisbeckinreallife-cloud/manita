// SQLite does not support Prisma enums, so MessageRole is stored as a
// constrained string. This module is the single source of truth for the
// allowed values and the runtime validators.

export const MESSAGE_ROLES = ["USER", "ASSISTANT", "SYSTEM"] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export function isMessageRole(value: unknown): value is MessageRole {
  return typeof value === "string" && (MESSAGE_ROLES as readonly string[]).includes(value);
}

export function assertMessageRole(value: string): MessageRole {
  if (!isMessageRole(value)) {
    throw new Error(`Invalid message role persisted in DB: ${value}`);
  }
  return value;
}
