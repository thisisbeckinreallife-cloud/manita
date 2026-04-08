import { describe, expect, it } from "vitest";
import {
  TASK_RUN_STATUSES,
  assertTaskRunStatus,
  isTaskRunStatus,
  isTaskRunTerminal,
} from "@/lib/domain/task-run-status";

describe("task run status", () => {
  it("enumerates the canonical values in lifecycle order", () => {
    expect(TASK_RUN_STATUSES).toEqual(["REQUESTED", "RUNNING", "DONE", "FAILED"]);
  });

  it("isTaskRunStatus accepts canonical values and rejects others", () => {
    for (const status of TASK_RUN_STATUSES) {
      expect(isTaskRunStatus(status)).toBe(true);
    }
    expect(isTaskRunStatus("completed")).toBe(false);
    expect(isTaskRunStatus(undefined)).toBe(false);
  });

  it("assertTaskRunStatus throws on unknown", () => {
    expect(assertTaskRunStatus("DONE")).toBe("DONE");
    expect(() => assertTaskRunStatus("completed")).toThrow(
      /Invalid task run status/,
    );
  });

  it("isTaskRunTerminal only returns true for DONE or FAILED", () => {
    expect(isTaskRunTerminal("DONE")).toBe(true);
    expect(isTaskRunTerminal("FAILED")).toBe(true);
    expect(isTaskRunTerminal("REQUESTED")).toBe(false);
    expect(isTaskRunTerminal("RUNNING")).toBe(false);
  });
});
