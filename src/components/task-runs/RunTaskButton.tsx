"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestTaskRunAction } from "@/app/actions/task-runs";
import { initialRequestTaskRunState } from "@/app/actions/task-runs.state";

export function RunTaskButton({ taskId }: { taskId: string }) {
  const [state, formAction] = useFormState(
    requestTaskRunAction,
    initialRequestTaskRunState,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="taskId" value={taskId} />
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
      {pending ? "Requesting…" : "Run task"}
    </button>
  );
}
