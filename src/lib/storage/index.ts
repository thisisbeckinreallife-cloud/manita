import path from "node:path";
import type { StorageAdapter } from "./adapter";
import { LocalFileSystemAdapter } from "./local";

/**
 * Returns the process-wide storage adapter. Slice 1b always returns the
 * local-filesystem adapter rooted at `<repo>/uploads`. Production storage
 * (S3, Railway volume, etc.) lands in a future slice and will be selected
 * here based on environment.
 */
let cached: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (cached) return cached;
  const root = process.env.STORAGE_LOCAL_ROOT
    ? path.resolve(process.env.STORAGE_LOCAL_ROOT)
    : path.resolve(process.cwd(), "uploads");
  cached = new LocalFileSystemAdapter(root);
  return cached;
}

export type { StorageAdapter } from "./adapter";
