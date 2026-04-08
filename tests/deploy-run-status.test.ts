import { describe, expect, it } from "vitest";
import {
  DEPLOY_RUN_STATUSES,
  assertDeployRunStatus,
  isDeployRunStatus,
  isDeployRunTerminal,
} from "@/lib/domain/deploy-run-status";
import {
  DEPLOY_EVENT_KINDS,
  assertDeployEventKind,
  isDeployEventKind,
} from "@/lib/domain/deploy-event-kind";

describe("deploy run status", () => {
  it("enumerates the canonical values in lifecycle order", () => {
    expect(DEPLOY_RUN_STATUSES).toEqual([
      "REQUESTED",
      "BUILDING",
      "DEPLOYING",
      "LIVE",
      "FAILED",
    ]);
  });

  it("isDeployRunStatus accepts canonical values and rejects others", () => {
    for (const status of DEPLOY_RUN_STATUSES) {
      expect(isDeployRunStatus(status)).toBe(true);
    }
    expect(isDeployRunStatus("success")).toBe(false);
    expect(isDeployRunStatus(undefined)).toBe(false);
  });

  it("assertDeployRunStatus throws on unknown", () => {
    expect(assertDeployRunStatus("LIVE")).toBe("LIVE");
    expect(() => assertDeployRunStatus("running")).toThrow(
      /Invalid deploy run status/,
    );
  });

  it("isDeployRunTerminal only returns true for LIVE or FAILED", () => {
    expect(isDeployRunTerminal("LIVE")).toBe(true);
    expect(isDeployRunTerminal("FAILED")).toBe(true);
    expect(isDeployRunTerminal("REQUESTED")).toBe(false);
    expect(isDeployRunTerminal("BUILDING")).toBe(false);
    expect(isDeployRunTerminal("DEPLOYING")).toBe(false);
  });
});

describe("deploy event kind", () => {
  it("enumerates the canonical kinds", () => {
    expect(DEPLOY_EVENT_KINDS).toEqual([
      "REQUESTED",
      "STATUS_CHANGED",
      "LOG",
      "FINISHED",
      "FAILED",
    ]);
  });

  it("isDeployEventKind narrows correctly", () => {
    for (const kind of DEPLOY_EVENT_KINDS) {
      expect(isDeployEventKind(kind)).toBe(true);
    }
    expect(isDeployEventKind("OTHER")).toBe(false);
  });

  it("assertDeployEventKind throws on unknown", () => {
    expect(assertDeployEventKind("LOG")).toBe("LOG");
    expect(() => assertDeployEventKind("nope")).toThrow(
      /Invalid deploy event kind/,
    );
  });
});
