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
 */

export type HealthResult =
  | { status: "ok"; db: "ok"; checkedAt: string }
  | {
      status: "degraded";
      db: "error";
      error: string;
      checkedAt: string;
    };

export async function checkHealth(
  pingDb: () => Promise<void>,
): Promise<HealthResult> {
  const checkedAt = new Date().toISOString();
  try {
    await pingDb();
    return { status: "ok", db: "ok", checkedAt };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    return { status: "degraded", db: "error", error: message, checkedAt };
  }
}
