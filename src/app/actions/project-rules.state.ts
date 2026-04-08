export type CreateProjectRuleActionState = {
  error: string | null;
  fieldErrors: Record<string, string[] | undefined> | null;
  succeededAt: number;
};

export const initialCreateProjectRuleState: CreateProjectRuleActionState = {
  error: null,
  fieldErrors: null,
  succeededAt: 0,
};
