import { z } from "zod";

export const requestTaskRunInput = z.object({
  taskId: z.string().min(1, "taskId is required"),
});

export type RequestTaskRunInput = z.infer<typeof requestTaskRunInput>;
