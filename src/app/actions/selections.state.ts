// Plain module — NOT marked "use server". See actions/folders.state.ts
// for the rationale.

export type SetSelectionActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialSetSelectionState: SetSelectionActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};
