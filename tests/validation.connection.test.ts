import { describe, expect, it } from "vitest";
import { createConnectionInput } from "@/lib/validation/connection";
import { PROVIDER_IDS } from "@/lib/domain/providers";

describe("createConnectionInput", () => {
  it("accepts a valid catalog provider and label", () => {
    const result = createConnectionInput.safeParse({
      provider: PROVIDER_IDS[0],
      label: "Personal key",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.provider).toBe(PROVIDER_IDS[0]);
      expect(result.data.label).toBe("Personal key");
    }
  });

  it("trims whitespace from the label", () => {
    const result = createConnectionInput.safeParse({
      provider: PROVIDER_IDS[0],
      label: "  Trim  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.label).toBe("Trim");
  });

  it("rejects an unknown provider", () => {
    const result = createConnectionInput.safeParse({
      provider: "totally-fake",
      label: "x",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty label", () => {
    const result = createConnectionInput.safeParse({
      provider: PROVIDER_IDS[0],
      label: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a label longer than 80 characters", () => {
    const result = createConnectionInput.safeParse({
      provider: PROVIDER_IDS[0],
      label: "x".repeat(81),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing provider", () => {
    const result = createConnectionInput.safeParse({ label: "x" });
    expect(result.success).toBe(false);
  });
});
