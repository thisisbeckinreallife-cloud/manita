import type { RailwayAdapter } from "./adapter";
import { RailwayHttpClient } from "./client";

let cached: RailwayAdapter | null = null;

export function getRailwayAdapter(): RailwayAdapter {
  if (cached) return cached;
  cached = new RailwayHttpClient();
  return cached;
}

export function setRailwayAdapter(adapter: RailwayAdapter | null): void {
  cached = adapter;
}

export type { RailwayAdapter } from "./adapter";
export { RailwayAdapterError } from "./adapter";
