/**
 * Operational health check for the Vibe Workspace.
 *
 * This is the unauthenticated probe used by Railway's HTTP healthcheck and
 * by external uptime monitors. It is deliberately narrow: it verifies that
 * the app process is up AND that the database layer is reachable. Any
 * other dependency (storage adapter, provider APIs) is intentionally
 * excluded from the probe so the signal stays honest and fast.
 *
 * The caller injects the db ping so this function can be unit-tested
 * without a real Prisma client and so the route handler controls the
 * actual query strategy.
 *
 * The HealthResult shape is the exact payload that the public endpoint
 * serializes to the client. It intentionally does NOT carry the raw
 * database error message: Prisma/pg errors can include infra
 * fingerprints (host, port, user, database name) that should not be
 * exposed on an unauthenticated URL. The route handler is responsible
 * for logging the real error server-side before the ping callback
 * re-throws into this function.
 */

export type HealthResult =
  | { status: "ok"; db: "ok"; checkedAt: string }
  | { status: "degraded"; db: "error"; checkedAt: string };

export async function checkHealth(
  pingDb: () => Promise<void>,
): Promise<HealthResult> {
  const checkedAt = new Date().toISOString();
  try {
    await pingDb();
    return { status: "ok", db: "ok", checkedAt };
  } catch {
    return { status: "degraded", db: "error", checkedAt };
  }
}
