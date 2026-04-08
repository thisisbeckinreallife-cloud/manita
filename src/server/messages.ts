import { db } from "@/lib/db";
import { createMessageInput } from "@/lib/validation/message";
import {
  assertMessageRole,
  type MessageRole,
} from "@/lib/domain/message-role";

export type MessageRecord = {
  id: string;
  role: MessageRole;
  content: string;
  taskId: string;
  createdAt: Date;
};

export type CreatedMessage = MessageRecord & { projectId: string };

const SELECT_MESSAGE = {
  id: true,
  role: true,
  content: true,
  taskId: true,
  createdAt: true,
} as const;

export async function listMessagesForTask(taskId: string): Promise<MessageRecord[]> {
  const rows = await db.taskMessage.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    select: SELECT_MESSAGE,
  });
  return rows.map((row) => ({ ...row, role: assertMessageRole(row.role) }));
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
  const created = await db.taskMessage.create({
    data: {
      taskId: input.taskId,
      role: input.role ?? "USER",
      content: input.content,
    },
    select: SELECT_MESSAGE,
  });
  return {
    ...created,
    role: assertMessageRole(created.role),
    projectId: task.folder.projectId,
  };
}
