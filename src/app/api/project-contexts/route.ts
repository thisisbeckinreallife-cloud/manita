import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createProjectContext } from "@/server/project-contexts";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const context = await createProjectContext(payload);
    return NextResponse.json({ context }, { status: 201 });
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
