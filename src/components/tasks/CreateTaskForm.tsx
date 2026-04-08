"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  createTaskAction,
  type CreateTaskActionState,
} from "@/app/actions/tasks";

const initialState: CreateTaskActionState = { error: null, fieldErrors: null };

export function CreateTaskForm({ folderId }: { folderId: string }) {
  const [state, formAction] = useFormState(createTaskAction, initialState);
  const inputId = `new-task-input-${folderId}`;

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="folderId" value={folderId} />
      <label htmlFor={inputId} className="sr-only">
        New task title
      </label>
      <div className="flex gap-1">
        <input
          id={inputId}
          name="title"
          required
          maxLength={120}
          placeholder="New task"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-xs text-ink-200 placeholder:text-ink-500 focus:border-ink-700 focus:bg-ink-950 focus:outline-none"
        />
        <AddButton />
      </div>
      {state.fieldErrors?.title?.[0] ? (
        <p className="px-2 text-[11px] text-bad">{state.fieldErrors.title[0]}</p>
      ) : null}
      {state.error && !state.fieldErrors ? (
        <p className="px-2 text-[11px] text-bad">{state.error}</p>
      ) : null}
    </form>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-md px-2 py-1 text-xs text-ink-400 transition hover:text-ink-200 disabled:opacity-50"
    >
      {pending ? "…" : "+"}
    </button>
  );
}
