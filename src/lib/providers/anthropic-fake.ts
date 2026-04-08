import {
  ProviderError,
  type ProviderCompleteInput,
  type ProviderCompleteResult,
  type ProviderErrorCode,
} from "./adapter";

/**
 * In-memory Anthropic client for tests. Never touches the network.
 * Behavior is deterministic: if `failWith` is set, every call throws the
 * configured ProviderErrorCode. Otherwise, every call returns the
 * configured `replyText` and records the input so assertions can verify
 * the prompt shape.
 *
 * Matches the shape of FakeGithubAdapter from slice 2.
 */
export class FakeAnthropicClient {
  private readonly failWith: ProviderErrorCode | null;
  private readonly replyText: string;
  calls: ProviderCompleteInput[] = [];

  constructor(
    options: { failWith?: ProviderErrorCode; replyText?: string } = {},
  ) {
    this.failWith = options.failWith ?? null;
    this.replyText = options.replyText ?? "fake reply";
  }

  async complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult> {
    this.calls.push(input);
    if (this.failWith) {
      throw new ProviderError(this.failWith, `fake client failure: ${this.failWith}`);
    }
    return {
      provider: "anthropic",
      model: input.model,
      text: this.replyText,
      stopReason: "end_turn",
    };
  }
}
