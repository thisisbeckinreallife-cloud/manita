import {
  makeDryRunResult,
  type ProviderAdapter,
  type ProviderDryRunInput,
  type ProviderDryRunResult,
} from "./adapter";

export const anthropicAdapter: ProviderAdapter = {
  id: "anthropic",
  async dryRun(input: ProviderDryRunInput): Promise<ProviderDryRunResult> {
    return makeDryRunResult("anthropic", input);
  },
};
