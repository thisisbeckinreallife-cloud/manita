// Provider adapter contract. Slice 1c shipped dry-run-only implementations.
// Slice 5c adds the `complete` method for real batch execution (Anthropic
// only for now; OpenAI stays dry-run and surfaces PROVIDER_NOT_IMPLEMENTED
// if called). The dry-run path is preserved so nothing downstream breaks.
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

// Slice 5c: real completion path. The runner builds this input from the
// task + project metadata + message history and passes it to complete().
export type ProviderCompleteMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProviderCompleteInput = {
  model: string;
  systemPrompt: string;
  messages: ProviderCompleteMessage[];
  maxTokens: number;
};

export type ProviderCompleteResult = {
  provider: string;
  model: string;
  text: string;
  stopReason: string | null;
};

// Structured error codes the provider layer may surface. The runner
// wraps these into TaskRunnerError so the server layer can persist the
// FAILED run row and the UI renders it honestly.
export type ProviderErrorCode =
  | "PROVIDER_TOKEN_NOT_CONFIGURED"
  | "PROVIDER_UNAUTHORIZED"
  | "PROVIDER_RATE_LIMITED"
  | "PROVIDER_API_ERROR"
  | "PROVIDER_NOT_IMPLEMENTED";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly status: number | null;
  readonly detail: string | null;
  constructor(
    code: ProviderErrorCode,
    detail: string | null = null,
    status: number | null = null,
  ) {
    super(code);
    this.name = "ProviderError";
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

export interface ProviderAdapter {
  readonly id: string;
  dryRun(input: ProviderDryRunInput): Promise<ProviderDryRunResult>;
  complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult>;
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
