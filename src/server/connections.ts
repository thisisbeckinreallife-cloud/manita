import { db } from "@/lib/db";
import { createConnectionInput } from "@/lib/validation/connection";
import { getOrCreateDefaultUser } from "./users";

export type ConnectionRecord = {
  id: string;
  provider: string;
  label: string;
  createdAt: Date;
};

const SELECT_CONNECTION = {
  id: true,
  provider: true,
  label: true,
  createdAt: true,
} as const;

export async function listConnectionsForOwner(): Promise<ConnectionRecord[]> {
  const owner = await getOrCreateDefaultUser();
  return db.modelProviderConnection.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    select: SELECT_CONNECTION,
  });
}

export async function createConnection(rawInput: unknown): Promise<ConnectionRecord> {
  const input = createConnectionInput.parse(rawInput);
  const owner = await getOrCreateDefaultUser();
  return db.modelProviderConnection.create({
    data: {
      provider: input.provider,
      label: input.label,
      ownerId: owner.id,
    },
    select: SELECT_CONNECTION,
  });
}
