// Plain module — NOT marked "use server". See actions/folders.state.ts
// for the rationale.

export type CreateAttachmentActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialCreateAttachmentState: CreateAttachmentActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};
