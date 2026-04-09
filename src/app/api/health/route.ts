import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkHealth } from "@/server/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result = await checkHealth(async () => {
    try {
      await db.$queryRawUnsafe("SELECT 1");
    } catch (error) {
      // Keep the real error in the server log for debugging. It is
      // intentionally NOT forwarded into the public JSON response so
      // the unauthenticated probe URL does not leak DB host, port,
      // user, database name, or other infra fingerprints from a raw
      // Prisma/pg error message.
      console.error("[api/health] db ping failed:", error);
      throw error;
    }
  });
  const status = result.status === "ok" ? 200 : 503;
  return NextResponse.json(result, { status });
}
