import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createConnection, listConnectionsForOwner } from "@/server/connections";

export const dynamic = "force-dynamic";

export async function GET() {
  const connections = await listConnectionsForOwner();
  return NextResponse.json({ connections });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const connection = await createConnection(payload);
    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.flatten() },
        { status: 422 },
      );
    }
    throw error;
  }
}
