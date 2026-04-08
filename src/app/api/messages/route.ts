import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createMessage } from "@/server/messages";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const message = await createMessage(payload);
    return NextResponse.json({ message }, { status: 201 });
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
      if (error.message === "PARENT_MESSAGE_NOT_FOUND") {
        return NextResponse.json(
          { error: "Parent message not found" },
          { status: 404 },
        );
      }
      if (error.message === "PARENT_MESSAGE_TASK_MISMATCH") {
        return NextResponse.json(
          { error: "Parent message belongs to a different task" },
          { status: 422 },
        );
      }
      if (error.message === "PARENT_MESSAGE_KIND_INVALID") {
        return NextResponse.json(
          { error: "Only a TOOL_CALL message can be a parent" },
          { status: 422 },
        );
      }
      if (error.message === "CHILD_MESSAGE_KIND_INVALID") {
        return NextResponse.json(
          { error: "Only a TOOL_RESULT can be nested under a TOOL_CALL" },
          { status: 422 },
        );
      }
    }
    throw error;
  }
}
