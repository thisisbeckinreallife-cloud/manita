import { describe, expect, it } from "vitest";
import {
  MAX_ATTACHMENT_BYTES,
  MAX_FILENAME_LENGTH,
  createAttachmentMetadataInput,
} from "@/lib/validation/attachment";

describe("createAttachmentMetadataInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "report.pdf",
      sizeBytes: 1024,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taskId).toBe("t1");
      expect(result.data.filename).toBe("report.pdf");
      expect(result.data.sizeBytes).toBe(1024);
      expect(result.data.mimeType).toBe("application/octet-stream");
    }
  });

  it("preserves an explicit mime type", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "image.png",
      mimeType: "image/png",
      sizeBytes: 2048,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.mimeType).toBe("image/png");
  });

  it("trims whitespace from the filename", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "  spaced.txt  ",
      sizeBytes: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.filename).toBe("spaced.txt");
  });

  it("rejects an empty filename", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "",
      sizeBytes: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a filename longer than the max", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "x".repeat(MAX_FILENAME_LENGTH + 1),
      sizeBytes: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing taskId", () => {
    const result = createAttachmentMetadataInput.safeParse({
      filename: "x.txt",
      sizeBytes: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative size", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "x.txt",
      sizeBytes: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer size", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "x.txt",
      sizeBytes: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a size over the 10 MB cap", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "x.txt",
      sizeBytes: MAX_ATTACHMENT_BYTES + 1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a size exactly at the cap", () => {
    const result = createAttachmentMetadataInput.safeParse({
      taskId: "t1",
      filename: "x.txt",
      sizeBytes: MAX_ATTACHMENT_BYTES,
    });
    expect(result.success).toBe(true);
  });
});
