import { describe, expect, it } from "vitest";
import { setSelectionInput } from "@/lib/validation/selection";
import { PROVIDER_CATALOG } from "@/lib/domain/providers";

const PROVIDER = PROVIDER_CATALOG[0]!.id;
const MODEL = PROVIDER_CATALOG[0]!.models[0]!;

describe("setSelectionInput", () => {
  it("accepts a valid (provider, model) pair", () => {
    const result = setSelectionInput.safeParse({
      taskId: "t1",
      provider: PROVIDER,
      model: MODEL,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taskId).toBe("t1");
      expect(result.data.provider).toBe(PROVIDER);
      expect(result.data.model).toBe(MODEL);
      expect(result.data.connectionId).toBeNull();
    }
  });

  it("preserves an explicit connectionId", () => {
    const result = setSelectionInput.safeParse({
      taskId: "t1",
      provider: PROVIDER,
      model: MODEL,
      connectionId: "c1",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.connectionId).toBe("c1");
  });

  it("normalizes a missing connectionId to null", () => {
    const result = setSelectionInput.safeParse({
      taskId: "t1",
      provider: PROVIDER,
      model: MODEL,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.connectionId).toBeNull();
  });

  it("rejects an unknown provider", () => {
    const result = setSelectionInput.safeParse({
      taskId: "t1",
      provider: "fake-provider",
      model: MODEL,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a model that does not belong to the provider", () => {
    const otherProvider = PROVIDER_CATALOG[1];
    if (!otherProvider) return; // skip if catalog has only one provider
    const result = setSelectionInput.safeParse({
      taskId: "t1",
      provider: PROVIDER,
      model: otherProvider.models[0],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing taskId", () => {
    const result = setSelectionInput.safeParse({
      provider: PROVIDER,
      model: MODEL,
    });
    expect(result.success).toBe(false);
  });
});
