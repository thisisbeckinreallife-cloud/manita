import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requestBootstrap } from "@/server/repository-links";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const link = await requestBootstrap(payload);
    // The persisted record is the source of truth. We explicitly branch
    // on every terminal state instead of a catch-all else so a future
    // REQUESTED stuck state (e.g., background reconcile) cannot be hidden
    // behind a 201 that implies success.
    if (link.status === "OBSERVED") {
      return NextResponse.json({ link }, { status: 201 });
    }
    if (link.status === "FAILED") {
      // 502 Bad Gateway: downstream provider returned an error we
      // persisted honestly; the record is included for the caller.
      return NextResponse.json({ link }, { status: 502 });
    }
    // REQUESTED is not a terminal state; the synchronous flow should
    // never return here, but if it does the caller gets a 202 Accepted
    // so clients know the work is in flight, not done.
    return NextResponse.json({ link }, { status: 202 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.flatten() },
        { status: 422 },
      );
    }
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    throw error;
  }
}
