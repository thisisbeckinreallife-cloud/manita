"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createConnectionAction } from "@/app/actions/connections";
import { initialCreateConnectionState } from "@/app/actions/connections.state";
import { PROVIDER_CATALOG } from "@/lib/domain/providers";

export function CreateConnectionForm() {
  const [state, formAction] = useFormState(
    createConnectionAction,
    initialCreateConnectionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.succeededAt > 0) formRef.current?.reset();
  }, [state.succeededAt]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="connection-provider"
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Provider
        </label>
        <select
          id="connection-provider"
          name="provider"
          required
          defaultValue={PROVIDER_CATALOG[0]?.id}
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 focus:border-accent focus:outline-none"
        >
          {PROVIDER_CATALOG.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.provider?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.provider[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="connection-label"
          className="text-[10px] font-semibold uppercase tracking-wider text-ink-400"
        >
          Label
        </label>
        <input
          id="connection-label"
          name="label"
          required
          maxLength={80}
          placeholder="e.g. Personal Anthropic"
          className="rounded-md border border-ink-700 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-100 placeholder:text-ink-500 focus:border-accent focus:outline-none"
        />
        {state.fieldErrors?.label?.[0] ? (
          <p className="text-[11px] text-bad">{state.fieldErrors.label[0]}</p>
        ) : null}
      </div>

      {state.error && !state.fieldErrors ? (
        <p className="text-[11px] text-bad">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-ink-700 px-2.5 py-1.5 text-xs font-semibold text-ink-100 transition hover:bg-ink-600 disabled:opacity-50"
    >
      {pending ? "Adding…" : "Add connection"}
    </button>
  );
}
