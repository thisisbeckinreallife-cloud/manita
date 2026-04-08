import {
  RailwayAdapterError,
  type RailwayAdapter,
  type RailwayErrorCode,
  type TriggerDeployInput,
  type TriggerDeployResult,
} from "./adapter";
import type { DeployRunStatus } from "@/lib/domain/deploy-run-status";

/**
 * In-memory Railway adapter for tests and local-only flows that must
 * not reach the network. Never used in production.
 */
export class FakeRailwayAdapter implements RailwayAdapter {
  private readonly failWith: RailwayErrorCode | null;
  private readonly finalStatus: DeployRunStatus;
  private readonly previewUrl: string | null;
  private readonly logs: string[];
  calls: TriggerDeployInput[] = [];

  constructor(
    options: {
      failWith?: RailwayErrorCode;
      finalStatus?: DeployRunStatus;
      previewUrl?: string | null;
      logs?: string[];
    } = {},
  ) {
    this.failWith = options.failWith ?? null;
    this.finalStatus = options.finalStatus ?? "LIVE";
    this.previewUrl =
      options.previewUrl !== undefined
        ? options.previewUrl
        : "https://fake.railway.local/service";
    this.logs = options.logs ?? ["fake: deployment accepted"];
  }

  async triggerDeploy(input: TriggerDeployInput): Promise<TriggerDeployResult> {
    this.calls.push(input);
    if (this.failWith) {
      throw new RailwayAdapterError(
        this.failWith,
        `fake adapter failure: ${this.failWith}`,
      );
    }
    return {
      externalId: `fake-${this.calls.length}`,
      status: this.finalStatus,
      previewUrl: this.finalStatus === "LIVE" ? this.previewUrl : null,
      logs: this.logs,
    };
  }
}
