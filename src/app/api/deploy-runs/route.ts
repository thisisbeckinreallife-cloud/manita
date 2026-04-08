import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requestDeploy } from "@/server/deploy-runs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const run = await requestDeploy(payload);
    if (run.status === "LIVE") {
      return NextResponse.json({ run }, { status: 201 });
    }
    if (run.status === "FAILED") {
      return NextResponse.json({ run }, { status: 502 });
    }
    // REQUESTED / BUILDING / DEPLOYING -> in flight.
    return NextResponse.json({ run }, { status: 202 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.flatten() },
        { status: 422 },
      );
    }
    if (
      error instanceof Error &&
      error.message === "DEPLOY_TARGET_NOT_FOUND"
    ) {
      return NextResponse.json(
        { error: "Deploy target not linked for this project" },
        { status: 404 },
      );
    }
    throw error;
  }
}
