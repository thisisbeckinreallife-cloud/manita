import { describe, expect, it } from "vitest";
import {
  REPOSITORY_LINK_STATUSES,
  assertRepositoryLinkStatus,
  isRepositoryLinkStatus,
} from "@/lib/domain/repository-link-status";

describe("repository link status", () => {
  it("enumerates the canonical values", () => {
    expect(REPOSITORY_LINK_STATUSES).toEqual(["REQUESTED", "OBSERVED", "FAILED"]);
  });

  it("isRepositoryLinkStatus accepts canonical values and rejects others", () => {
    for (const status of REPOSITORY_LINK_STATUSES) {
      expect(isRepositoryLinkStatus(status)).toBe(true);
    }
    expect(isRepositoryLinkStatus("pending")).toBe(false);
    expect(isRepositoryLinkStatus(undefined)).toBe(false);
    expect(isRepositoryLinkStatus(42)).toBe(false);
  });

  it("assertRepositoryLinkStatus narrows valid values and throws on bad ones", () => {
    expect(assertRepositoryLinkStatus("OBSERVED")).toBe("OBSERVED");
    expect(() => assertRepositoryLinkStatus("pending")).toThrow(
      /Invalid repository link status/,
    );
  });
});
