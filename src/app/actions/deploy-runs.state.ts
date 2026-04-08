// Plain module — NOT marked "use server". See actions/folders.state.ts
// for the rationale.

export type RequestDeployActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialRequestDeployState: RequestDeployActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};
