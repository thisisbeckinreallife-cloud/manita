import { db } from "@/lib/db";

const DEFAULT_USER_EMAIL = "owner@local";

/**
 * Slice 0b helper: returns the single local owner used until real auth lands
 * in a later phase. Idempotent — creates the user on first call.
 */
export async function getOrCreateDefaultUser() {
  const existing = await db.user.findUnique({ where: { email: DEFAULT_USER_EMAIL } });
  if (existing) return existing;
  return db.user.create({
    data: { email: DEFAULT_USER_EMAIL, name: "Local owner" },
  });
}
