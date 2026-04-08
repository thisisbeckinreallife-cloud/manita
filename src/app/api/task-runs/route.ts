import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requestTaskRun } from "@/server/task-runs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const run = await requestTaskRun(payload);
    if (run.status === "DONE") {
      return NextResponse.json({ run }, { status: 201 });
    }
    if (run.status === "FAILED") {
      return NextResponse.json({ run }, { status: 502 });
    }
    // REQUESTED / RUNNING -> in flight (synchronous stub should not land
    // here, but the honest branch is kept for a future async runner).
    return NextResponse.json({ run }, { status: 202 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.flatten() },
        { status: 422 },
      );
    }
    if (error instanceof Error && error.message === "TASK_NOT_FOUND") {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    throw error;
  }
}
