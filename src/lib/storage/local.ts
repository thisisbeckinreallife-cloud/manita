import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./adapter";

/**
 * Local-filesystem storage adapter for development.
 *
 * Files are written to `<rootDir>/<key>` where `key` is a random hex string
 * generated server-side. The original filename is NEVER part of the key, so
 * uploads cannot escape the root via path traversal.
 *
 * On-disk cleanup is intentionally not handled when a Task is deleted via
 * Prisma cascade — slice 1b only persists rows, file GC is a follow-up.
 */
export class LocalFileSystemAdapter implements StorageAdapter {
  private readonly rootDir: string;
  private rootEnsured = false;

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir);
  }

  async put(content: Buffer): Promise<{ key: string }> {
    await this.ensureRoot();
    const key = randomBytes(16).toString("hex");
    const target = this.resolveKey(key);
    await writeFile(target, content);
    return { key };
  }

  async read(key: string): Promise<Buffer> {
    const target = this.resolveKey(key);
    return readFile(target);
  }

  async delete(key: string): Promise<void> {
    const target = this.resolveKey(key);
    try {
      await unlink(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
  }

  private async ensureRoot(): Promise<void> {
    if (this.rootEnsured) return;
    await mkdir(this.rootDir, { recursive: true });
    this.rootEnsured = true;
  }

  private resolveKey(key: string): string {
    // Reject anything that could escape the root. Keys are server-generated
    // hex, so this is belt-and-braces in case a corrupt DB row leaks in.
    if (!/^[a-f0-9]{32}$/.test(key)) {
      throw new Error(`Invalid storage key: ${key}`);
    }
    return path.join(this.rootDir, key);
  }
}
