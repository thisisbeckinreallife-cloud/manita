// Plain module — NOT marked "use server". Next.js 15 enforces that
// "use server" files only export async functions, so the type and the
// initial state for createFolderAction must live outside actions/folders.ts.

export type CreateFolderActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialCreateFolderState: CreateFolderActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};
