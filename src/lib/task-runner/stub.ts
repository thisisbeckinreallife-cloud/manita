import {
  TaskRunnerError,
  type RunTaskInput,
  type RunTaskResult,
  type TaskRunnerAdapter,
} from "./adapter";

/**
 * Dry-run task runner used in dev and in tests. Never touches the
 * network. Slice 4b only needs the row to exist and the honesty
 * contract to hold; real execution lands in a later slice.
 *
 * Contract:
 *   - if no model is selected on the task, throw TASK_NO_MODEL_SELECTED
 *     so the server layer persists a FAILED row the UI can render
 *     honestly.
 *   - otherwise, return DONE immediately with a descriptive log line
 *     that names the provider/model and the message count snapshot.
 */
export class StubTaskRunner implements TaskRunnerAdapter {
  calls: RunTaskInput[] = [];

  async runTask(input: RunTaskInput): Promise<RunTaskResult> {
    this.calls.push(input);
    if (!input.provider || !input.model) {
      throw new TaskRunnerError(
        "TASK_NO_MODEL_SELECTED",
        "Pick a provider/model on the task before requesting a run.",
      );
    }
    return {
      status: "DONE",
      logs: [
        `stub runner: no-op completion using ${input.provider}/${input.model}`,
        `stub runner: ${input.messageCount} message(s) in context at trigger time`,
      ],
    };
  }
}
