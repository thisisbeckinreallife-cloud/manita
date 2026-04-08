import { db } from "@/lib/db";
import { createMessageInput } from "@/lib/validation/message";
import {
  assertMessageRole,
  type MessageRole,
} from "@/lib/domain/message-role";
import {
  assertMessageKind,
  type MessageKind,
} from "@/lib/domain/message-kind";

export type MessageRecord = {
  id: string;
  role: MessageRole;
  kind: MessageKind;
  content: string;
  payload: string | null;
  parentMessageId: string | null;
  taskId: string;
  createdAt: Date;
};

export type CreatedMessage = MessageRecord & { projectId: string };

const SELECT_MESSAGE = {
  id: true,
  role: true,
  kind: true,
  content: true,
  payload: true,
  parentMessageId: true,
  taskId: true,
  createdAt: true,
} as const;

function narrow(row: {
  id: string;
  role: string;
  kind: string;
  content: string;
  payload: string | null;
  parentMessageId: string | null;
  taskId: string;
  createdAt: Date;
}): MessageRecord {
  return {
    ...row,
    role: assertMessageRole(row.role),
    kind: assertMessageKind(row.kind),
  };
}

export async function listMessagesForTask(taskId: string): Promise<MessageRecord[]> {
  const rows = await db.taskMessage.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    select: SELECT_MESSAGE,
  });
  return rows.map(narrow);
}

export async function createMessage(rawInput: unknown): Promise<CreatedMessage> {
  const input = createMessageInput.parse(rawInput);
  const task = await db.task.findUnique({
    where: { id: input.taskId },
    select: { id: true, folder: { select: { projectId: true } } },
  });
  if (!task) {
    throw new Error("TASK_NOT_FOUND");
  }

  // If parentMessageId is supplied, verify the parent exists, belongs
  // to the same task, AND is a TOOL_CALL — the only kind that can
  // legally act as a parent in slice 5a. The child must itself be a
  // TOOL_RESULT. Any violation would silently disappear from the UI
  // tree builder, so we reject them honestly at the server boundary.
  if (input.parentMessageId) {
    const parent = await db.taskMessage.findUnique({
      where: { id: input.parentMessageId },
      select: { taskId: true, kind: true },
    });
    if (!parent) {
      throw new Error("PARENT_MESSAGE_NOT_FOUND");
    }
    if (parent.taskId !== input.taskId) {
      throw new Error("PARENT_MESSAGE_TASK_MISMATCH");
    }
    if (parent.kind !== "TOOL_CALL") {
      throw new Error("PARENT_MESSAGE_KIND_INVALID");
    }
    if ((input.kind ?? "TEXT") !== "TOOL_RESULT") {
      throw new Error("CHILD_MESSAGE_KIND_INVALID");
    }
  }

  const created = await db.taskMessage.create({
    data: {
      taskId: input.taskId,
      role: input.role ?? "USER",
      kind: input.kind ?? "TEXT",
      content: input.content,
      payload: input.payload ?? null,
      parentMessageId: input.parentMessageId ?? null,
    },
    select: SELECT_MESSAGE,
  });
  return {
    ...narrow(created),
    projectId: task.folder.projectId,
  };
}
