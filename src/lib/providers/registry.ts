import type { ProviderAdapter } from "./adapter";
import { anthropicAdapter } from "./anthropic";
import { openaiAdapter } from "./openai";

const REGISTRY: ReadonlyMap<string, ProviderAdapter> = new Map([
  [anthropicAdapter.id, anthropicAdapter],
  [openaiAdapter.id, openaiAdapter],
]);

export function getProviderAdapter(id: string): ProviderAdapter | undefined {
  return REGISTRY.get(id);
}

export function listProviderAdapters(): ProviderAdapter[] {
  return Array.from(REGISTRY.values());
}
