import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkHealth } from "@/server/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const result = await checkHealth(async () => {
    await db.$queryRawUnsafe("SELECT 1");
  });
  const status = result.status === "ok" ? 200 : 503;
  return NextResponse.json(result, { status });
}
