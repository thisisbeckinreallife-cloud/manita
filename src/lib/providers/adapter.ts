// Provider adapter contract. Slice 1c ships dry-run-only implementations
// so the rest of the app can target the interface today and the real
// network calls can land later without touching call sites.
//
// Rule: nothing outside `src/lib/providers/**` may import a vendor SDK.
// Add a new provider by implementing this interface and registering it
// in `registry.ts`.

export type ProviderDryRunInput = {
  model: string;
  prompt: string;
};

export type ProviderDryRunResult = {
  provider: string;
  model: string;
  // Slice 1c never produces real completions; the result is a structured
  // marker so callers can plumb it through and tests can assert against it.
  status: "dry-run";
  echoedPromptPreview: string;
};

export interface ProviderAdapter {
  readonly id: string;
  dryRun(input: ProviderDryRunInput): Promise<ProviderDryRunResult>;
}

export function makeDryRunResult(
  providerId: string,
  input: ProviderDryRunInput,
): ProviderDryRunResult {
  const preview =
    input.prompt.length > 80 ? `${input.prompt.slice(0, 77)}...` : input.prompt;
  return {
    provider: providerId,
    model: input.model,
    status: "dry-run",
    echoedPromptPreview: preview,
  };
}
