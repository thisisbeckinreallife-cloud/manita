import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalFileSystemAdapter } from "@/lib/storage/local";

describe("LocalFileSystemAdapter", () => {
  let rootDir: string;
  let adapter: LocalFileSystemAdapter;

  beforeEach(async () => {
    rootDir = await mkdtemp(path.join(tmpdir(), "vibe-storage-test-"));
    adapter = new LocalFileSystemAdapter(rootDir);
  });

  afterEach(async () => {
    await rm(rootDir, { recursive: true, force: true });
  });

  it("round-trips bytes through put/read", async () => {
    const content = Buffer.from("hello world", "utf8");
    const { key } = await adapter.put(content);
    expect(key).toMatch(/^[a-f0-9]{32}$/);
    const readBack = await adapter.read(key);
    expect(readBack.equals(content)).toBe(true);
  });

  it("returns a unique key for every put", async () => {
    const a = await adapter.put(Buffer.from("a"));
    const b = await adapter.put(Buffer.from("b"));
    expect(a.key).not.toBe(b.key);
  });

  it("creates the root directory on first put", async () => {
    const fresh = path.join(rootDir, "nested", "deep");
    const localAdapter = new LocalFileSystemAdapter(fresh);
    await localAdapter.put(Buffer.from("hi"));
    const stats = await stat(fresh);
    expect(stats.isDirectory()).toBe(true);
  });

  it("delete removes the file and is a no-op for unknown keys", async () => {
    const { key } = await adapter.put(Buffer.from("bye"));
    await adapter.delete(key);
    const filesAfter = await readdir(rootDir);
    expect(filesAfter).not.toContain(key);
    // Second delete on the same key must not throw.
    await expect(adapter.delete(key)).resolves.toBeUndefined();
  });

  it("rejects keys that do not match the server-generated format", async () => {
    await expect(adapter.read("../etc/passwd")).rejects.toThrow(/Invalid storage key/);
    await expect(adapter.read("a/b")).rejects.toThrow(/Invalid storage key/);
    await expect(adapter.delete("not-hex")).rejects.toThrow(/Invalid storage key/);
  });
});
