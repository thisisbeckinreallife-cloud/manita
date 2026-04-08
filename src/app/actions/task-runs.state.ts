// Plain module — NOT marked "use server". See actions/folders.state.ts
// for the rationale.

export type RequestTaskRunActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialRequestTaskRunState: RequestTaskRunActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};
