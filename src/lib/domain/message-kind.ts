// SQLite does not support Prisma enums, so TaskMessage.kind is stored as
// a constrained string. Single source of truth for the allowed values
// and the runtime validators.
//
// Payload shapes (JSON-serialized into TaskMessage.payload):
//   TEXT          — no payload (content is the body text).
//   PLAN          — { "steps": [{ "index": number, "title": string,
//                      "status": "REQUESTED"|"RUNNING"|"DONE"|"FAILED" }, ...] }
//   TOOL_CALL     — { "tool": string, "title": string, "command"?: string,
//                      "target"?: string }
//   TOOL_RESULT   — { "ok": boolean, "excerpt"?: string, "lines"?: number }
//
// Slice 5a ships the schema + UI dispatch; downstream slices fill the
// payloads with real runner output.

export const MESSAGE_KINDS = [
  "TEXT",
  "PLAN",
  "TOOL_CALL",
  "TOOL_RESULT",
] as const;

export type MessageKind = (typeof MESSAGE_KINDS)[number];

export function isMessageKind(value: unknown): value is MessageKind {
  return (
    typeof value === "string" &&
    (MESSAGE_KINDS as readonly string[]).includes(value)
  );
}

export function assertMessageKind(value: string): MessageKind {
  if (!isMessageKind(value)) {
    throw new Error(`Invalid message kind persisted in DB: ${value}`);
  }
  return value;
}
