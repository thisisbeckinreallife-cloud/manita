import {
  makeDryRunResult,
  ProviderError,
  type ProviderAdapter,
  type ProviderCompleteInput,
  type ProviderCompleteResult,
  type ProviderDryRunInput,
  type ProviderDryRunResult,
} from "./adapter";

export const openaiAdapter: ProviderAdapter = {
  id: "openai",
  async dryRun(input: ProviderDryRunInput): Promise<ProviderDryRunResult> {
    return makeDryRunResult("openai", input);
  },
  async complete(_input: ProviderCompleteInput): Promise<ProviderCompleteResult> {
    // Real OpenAI execution is deferred to a follow-up slice. The
    // adapter still implements the interface so the runner can dispatch
    // uniformly; attempting to actually call it surfaces a structured
    // error the UI renders honestly.
    throw new ProviderError(
      "PROVIDER_NOT_IMPLEMENTED",
      "OpenAI completions are not yet implemented. Use an Anthropic model for now.",
    );
  },
};
