import { describe, expect, it } from "vitest";
import {
  MESSAGE_KINDS,
  assertMessageKind,
  isMessageKind,
} from "@/lib/domain/message-kind";

describe("message kind", () => {
  it("enumerates the canonical values", () => {
    expect(MESSAGE_KINDS).toEqual(["TEXT", "PLAN", "TOOL_CALL", "TOOL_RESULT"]);
  });

  it("isMessageKind accepts canonical values and rejects others", () => {
    for (const kind of MESSAGE_KINDS) {
      expect(isMessageKind(kind)).toBe(true);
    }
    expect(isMessageKind("plain")).toBe(false);
    expect(isMessageKind(undefined)).toBe(false);
    expect(isMessageKind(42)).toBe(false);
  });

  it("assertMessageKind narrows valid values and throws on bad ones", () => {
    expect(assertMessageKind("TEXT")).toBe("TEXT");
    expect(assertMessageKind("TOOL_CALL")).toBe("TOOL_CALL");
    expect(() => assertMessageKind("plain")).toThrow(/Invalid message kind/);
  });
});
