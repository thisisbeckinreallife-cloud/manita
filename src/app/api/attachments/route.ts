import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createAttachment } from "@/server/attachments";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const taskId = formData.get("taskId");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing file field" },
      { status: 400 },
    );
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json(
      { error: "Failed to read uploaded file" },
      { status: 400 },
    );
  }

  try {
    const attachment = await createAttachment({
      taskId,
      filename: file.name,
      mimeType: file.type || undefined,
      sizeBytes: bytes.byteLength,
      bytes,
    });
    return NextResponse.json({ attachment }, { status: 201 });
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
      if (error.message === "FILE_TOO_LARGE") {
        return NextResponse.json(
          { error: "File exceeds the 10 MB limit" },
          { status: 413 },
        );
      }
    }
    throw error;
  }
}
