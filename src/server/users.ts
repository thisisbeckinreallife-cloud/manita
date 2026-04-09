import { db } from "@/lib/db";

const DEFAULT_USER_EMAIL = "owner@local";

/**
 * Slice 0b helper: returns the single local owner used until real auth lands
 * in a later phase. Idempotent — uses upsert so concurrent callers on a cold
 * DB (e.g. first render's Promise.all of server queries) cannot race into a
 * P2002 unique-constraint violation on the email column.
 */
export async function getOrCreateDefaultUser() {
  return db.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: "Local owner" },
  });
}
