import type { TaskRunnerAdapter } from "./adapter";
import { StubTaskRunner } from "./stub";

let cached: TaskRunnerAdapter | null = null;

export function getTaskRunnerAdapter(): TaskRunnerAdapter {
  if (cached) return cached;
  cached = new StubTaskRunner();
  return cached;
}

export function setTaskRunnerAdapter(adapter: TaskRunnerAdapter | null): void {
  cached = adapter;
}

export type { TaskRunnerAdapter } from "./adapter";
export { TaskRunnerError } from "./adapter";
