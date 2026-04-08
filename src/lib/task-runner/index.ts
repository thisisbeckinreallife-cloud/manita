import type { TaskRunnerAdapter } from "./adapter";
import { ProviderTaskRunner } from "./provider-runner";

let cached: TaskRunnerAdapter | null = null;

/**
 * Process-wide task runner singleton. Slice 5c swapped the default from
 * StubTaskRunner to ProviderTaskRunner (real Anthropic execution). Tests
 * that need the stub construct `StubTaskRunner` directly and inject it
 * via `setTaskRunnerAdapter` so the registry stays out of the stub's
 * import graph.
 */
export function getTaskRunnerAdapter(): TaskRunnerAdapter {
  if (cached) return cached;
  cached = new ProviderTaskRunner();
  return cached;
}

export function setTaskRunnerAdapter(adapter: TaskRunnerAdapter | null): void {
  cached = adapter;
}

export type { TaskRunnerAdapter } from "./adapter";
export { TaskRunnerError } from "./adapter";
