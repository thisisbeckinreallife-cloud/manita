import {
  makeDryRunResult,
  type ProviderAdapter,
  type ProviderCompleteInput,
  type ProviderCompleteResult,
  type ProviderDryRunInput,
  type ProviderDryRunResult,
} from "./adapter";
import { AnthropicHttpClient } from "./anthropic-client";

// Real anthropic adapter. The HTTP client is constructed lazily so
// importing this module does not read process.env at module-load time
// (which matters for tests that want to set the env after import).
let cachedClient: AnthropicHttpClient | null = null;

function getClient(): AnthropicHttpClient {
  if (!cachedClient) {
    cachedClient = new AnthropicHttpClient();
  }
  return cachedClient;
}

// Test seam: lets tests inject FakeAnthropicClient via
// setAnthropicClient without touching the registry or module graph.
export function setAnthropicClient(
  client: { complete: AnthropicHttpClient["complete"] } | null,
): void {
  cachedClient = client as AnthropicHttpClient | null;
}

export const anthropicAdapter: ProviderAdapter = {
  id: "anthropic",
  async dryRun(input: ProviderDryRunInput): Promise<ProviderDryRunResult> {
    return makeDryRunResult("anthropic", input);
  },
  async complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult> {
    return getClient().complete(input);
  },
};
