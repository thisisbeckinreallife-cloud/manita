// Canonical catalog of model providers and their models. This is the
// single source of truth — validation, UI dropdowns, and adapter dispatch
// all derive from this list. Add a provider here, then implement its
// adapter in src/lib/providers/<id>.ts and register it.
//
// Slice 1c ships only the catalog + dry-run adapters. Real provider calls
// land in a future "execute task" slice.

export type ProviderCatalogEntry = {
  readonly id: string;
  readonly label: string;
  readonly models: readonly string[];
};

export const PROVIDER_CATALOG: readonly ProviderCatalogEntry[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    models: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5"],
  },
  {
    id: "openai",
    label: "OpenAI",
    models: ["gpt-5", "gpt-5-mini", "gpt-5-nano"],
  },
] as const;

export const PROVIDER_IDS = PROVIDER_CATALOG.map((p) => p.id) as readonly string[];

export function isKnownProvider(value: unknown): value is string {
  return typeof value === "string" && PROVIDER_IDS.includes(value);
}

export function getProvider(id: string): ProviderCatalogEntry | undefined {
  return PROVIDER_CATALOG.find((entry) => entry.id === id);
}

export function isKnownModel(providerId: string, model: unknown): model is string {
  if (typeof model !== "string") return false;
  const provider = getProvider(providerId);
  if (!provider) return false;
  return provider.models.includes(model);
}

export function listAllProviderModelPairs(): ReadonlyArray<{
  provider: string;
  providerLabel: string;
  model: string;
}> {
  return PROVIDER_CATALOG.flatMap((entry) =>
    entry.models.map((model) => ({
      provider: entry.id,
      providerLabel: entry.label,
      model,
    })),
  );
}
