"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestDeployAction } from "@/app/actions/deploy-runs";
import { initialRequestDeployState } from "@/app/actions/deploy-runs.state";

export function TriggerDeployButton({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState(
    requestDeployAction,
    initialRequestDeployState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="projectId" value={projectId} />
      <SubmitButton />
      {state.error ? (
        <p className="text-[11px] text-bad">{state.error}</p>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-ink-950 transition disabled:opacity-50"
    >
      {pending ? "Requesting…" : "Deploy now"}
    </button>
  );
}
