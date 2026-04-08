import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { setSelectionForTask } from "@/server/selections";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const selection = await setSelectionForTask(payload);
    return NextResponse.json({ selection }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.flatten() },
        { status: 422 },
      );
    }
    if (error instanceof Error) {
      if (error.message === "TASK_NOT_FOUND") {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      if (error.message === "CONNECTION_NOT_FOUND") {
        return NextResponse.json({ error: "Connection not found" }, { status: 404 });
      }
      if (error.message === "CONNECTION_PROVIDER_MISMATCH") {
        return NextResponse.json(
          { error: "Connection provider does not match the requested provider" },
          { status: 422 },
        );
      }
    }
    throw error;
  }
}
