import type { GithubAdapter } from "./adapter";
import { GithubHttpClient } from "./client";

let cached: GithubAdapter | null = null;

/**
 * Process-wide GitHub adapter singleton. Always returns the HTTP client
 * in production; tests construct FakeGithubAdapter directly and inject it
 * via setGithubAdapter so the registry stays out of the fake's import graph.
 */
export function getGithubAdapter(): GithubAdapter {
  if (cached) return cached;
  cached = new GithubHttpClient();
  return cached;
}

export function setGithubAdapter(adapter: GithubAdapter | null): void {
  cached = adapter;
}

export type { GithubAdapter } from "./adapter";
export { GithubAdapterError } from "./adapter";
