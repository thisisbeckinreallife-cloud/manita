export type CreateProjectSkillReferenceActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialCreateProjectSkillReferenceState: CreateProjectSkillReferenceActionState =
  {
    error: null,
    fieldErrors: null,
    succeededAt: 0,
  };
