"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  setSelectionAction,
  initialSetSelectionState,
} from "@/app/actions/selections";
import { listAllProviderModelPairs } from "@/lib/domain/providers";
import type { SelectionRecord } from "@/server/selections";

export function ModelSelector({
  taskId,
  current,
}: {
  taskId: string;
  current: SelectionRecord | null;
}) {
  const [state, formAction] = useFormState(
    setSelectionAction,
    initialSetSelectionState,
  );
  const pairs = listAllProviderModelPairs();
  const currentValue = current ? `${current.provider}::${current.model}` : "";

  return (
    <form
      action={formAction}
      className="flex flex-col gap-1"
      onChange={(event) => {
        // Auto-submit on change so the user does not need a confirm click.
        if ((event.target as HTMLElement).tagName === "SELECT") {
          (event.currentTarget as HTMLFormElement).requestSubmit();
        }
      }}
    >
      <input type="hidden" name="taskId" value={taskId} />
      <label htmlFor={`model-selector-${taskId}`} className="sr-only">
        Model selection
      </label>
      <div className="flex items-center gap-2">
        <select
          id={`model-selector-${taskId}`}
          name="pair"
          defaultValue={currentValue}
          className="rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1 text-xs text-ink-100 focus:border-accent focus:outline-none"
        >
          {!current ? (
            <option value="" disabled>
              No model selected
            </option>
          ) : null}
          {pairs.map((pair) => {
            const value = `${pair.provider}::${pair.model}`;
            return (
              <option key={value} value={value}>
                {pair.providerLabel} · {pair.model}
              </option>
            );
          })}
        </select>
        <Status />
      </div>
      {state.error ? <p className="text-[11px] text-bad">{state.error}</p> : null}
    </form>
  );
}

function Status() {
  const { pending } = useFormStatus();
  if (pending) {
    return <span className="text-[11px] text-ink-500">Saving…</span>;
  }
  return null;
}
