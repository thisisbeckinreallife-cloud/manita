export type CreateProjectContextActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialCreateProjectContextState: CreateProjectContextActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};
