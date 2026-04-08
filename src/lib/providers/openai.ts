import {
  makeDryRunResult,
  type ProviderAdapter,
  type ProviderDryRunInput,
  type ProviderDryRunResult,
} from "./adapter";

export const openaiAdapter: ProviderAdapter = {
  id: "openai",
  async dryRun(input: ProviderDryRunInput): Promise<ProviderDryRunResult> {
    return makeDryRunResult("openai", input);
  },
};
