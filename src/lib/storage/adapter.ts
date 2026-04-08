// Storage adapter contract. The product spec calls for a local dev adapter
// and a production storage abstraction; this interface is the boundary so
// the rest of the app never depends on a concrete vendor.
//
// Slice 1b only ships the local-filesystem implementation. Future slices
// can add an S3/Railway adapter without touching callers.

export interface StorageAdapter {
  /**
   * Persist the given bytes. Returns an opaque key that callers must store
   * (in the DB) to read the file back later. Implementations MUST NOT
   * derive the key from any user-controlled value (no path traversal).
   */
  put(content: Buffer): Promise<{ key: string }>;

  /**
   * Read the bytes for a previously-persisted key. Throws if missing.
   */
  read(key: string): Promise<Buffer>;

  /**
   * Remove the bytes for a key. No-op if the key is unknown.
   */
  delete(key: string): Promise<void>;
}
