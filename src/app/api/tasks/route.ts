import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createTask } from "@/server/tasks";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const task = await createTask(payload);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.flatten() },
        { status: 422 },
      );
    }
    if (error instanceof Error && error.message === "FOLDER_NOT_FOUND") {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    throw error;
  }
}
