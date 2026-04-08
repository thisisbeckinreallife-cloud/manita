import { describe, expect, it } from "vitest";
import {
  PROVIDER_CATALOG,
  PROVIDER_IDS,
  getProvider,
  isKnownModel,
  isKnownProvider,
  listAllProviderModelPairs,
} from "@/lib/domain/providers";
import { getProviderAdapter, listProviderAdapters } from "@/lib/providers/registry";

describe("provider catalog", () => {
  it("ships at least one provider with at least one model", () => {
    expect(PROVIDER_CATALOG.length).toBeGreaterThan(0);
    for (const entry of PROVIDER_CATALOG) {
      expect(entry.models.length).toBeGreaterThan(0);
    }
  });

  it("PROVIDER_IDS matches the catalog", () => {
    expect(PROVIDER_IDS).toEqual(PROVIDER_CATALOG.map((p) => p.id));
  });

  it("isKnownProvider accepts catalog entries and rejects others", () => {
    for (const id of PROVIDER_IDS) {
      expect(isKnownProvider(id)).toBe(true);
    }
    expect(isKnownProvider("definitely-not-a-provider")).toBe(false);
    expect(isKnownProvider(undefined)).toBe(false);
    expect(isKnownProvider(42)).toBe(false);
  });

  it("getProvider returns the correct entry or undefined", () => {
    const first = PROVIDER_CATALOG[0]!;
    expect(getProvider(first.id)?.id).toBe(first.id);
    expect(getProvider("nope")).toBeUndefined();
  });

  it("isKnownModel only accepts pairs that exist in the catalog", () => {
    for (const provider of PROVIDER_CATALOG) {
      for (const model of provider.models) {
        expect(isKnownModel(provider.id, model)).toBe(true);
      }
    }
    expect(isKnownModel("anthropic", "gpt-5")).toBe(false);
    expect(isKnownModel("openai", "claude-opus-4-6")).toBe(false);
    expect(isKnownModel("nope", "claude-opus-4-6")).toBe(false);
  });

  it("listAllProviderModelPairs flattens every provider's models", () => {
    const expectedCount = PROVIDER_CATALOG.reduce(
      (sum, entry) => sum + entry.models.length,
      0,
    );
    const pairs = listAllProviderModelPairs();
    expect(pairs.length).toBe(expectedCount);
  });
});

describe("provider registry", () => {
  it("registers an adapter for every catalog provider", () => {
    for (const id of PROVIDER_IDS) {
      const adapter = getProviderAdapter(id);
      expect(adapter, `missing adapter for provider ${id}`).toBeDefined();
      expect(adapter?.id).toBe(id);
    }
  });

  it("listProviderAdapters returns one adapter per catalog provider", () => {
    expect(listProviderAdapters().length).toBe(PROVIDER_CATALOG.length);
  });

  it("dryRun returns a structured marker without making network calls", async () => {
    const adapter = getProviderAdapter(PROVIDER_CATALOG[0]!.id)!;
    const result = await adapter.dryRun({
      model: PROVIDER_CATALOG[0]!.models[0]!,
      prompt: "hello world",
    });
    expect(result.status).toBe("dry-run");
    expect(result.provider).toBe(adapter.id);
    expect(result.model).toBe(PROVIDER_CATALOG[0]!.models[0]);
    expect(result.echoedPromptPreview).toBe("hello world");
  });

  it("dryRun truncates long prompt previews", async () => {
    const adapter = getProviderAdapter(PROVIDER_CATALOG[0]!.id)!;
    const long = "x".repeat(200);
    const result = await adapter.dryRun({
      model: PROVIDER_CATALOG[0]!.models[0]!,
      prompt: long,
    });
    expect(result.echoedPromptPreview.length).toBeLessThanOrEqual(80);
    expect(result.echoedPromptPreview.endsWith("...")).toBe(true);
  });
});
