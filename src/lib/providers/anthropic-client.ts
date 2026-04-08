import { readFileSync } from "node:fs";
import {
  ProviderError,
  type ProviderCompleteInput,
  type ProviderCompleteResult,
} from "./adapter";

/**
 * Production Anthropic client. Uses the native `fetch` client against
 * api.anthropic.com (no vendor SDK dependency), matching the pattern
 * established by src/lib/github/client.ts.
 *
 * The API key is resolved in this order:
 *   1. `options.apiKey` (tests only)
 *   2. `process.env.ANTHROPIC_API_KEY`
 *   3. The file at `process.env.ANTHROPIC_API_KEY_FILE`, if set. The
 *      file is expected to contain the raw key (plus an optional
 *      trailing newline). File is read at call time; the contents are
 *      never logged, cached in the error path, or returned from any
 *      method.
 *
 * When no key can be resolved, every call throws
 * PROVIDER_TOKEN_NOT_CONFIGURED. The server layer surfaces that as a
 * FAILED TaskRun row and the UI renders it honestly.
 *
 * Nothing outside src/lib/providers/** may import this file directly;
 * the entry point is src/lib/providers/anthropic.ts which wires the
 * client into the ProviderAdapter interface.
 */
export class AnthropicHttpClient {
  private readonly injectedKey: string | undefined;
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(options: { apiKey?: string; baseUrl?: string; apiVersion?: string } = {}) {
    this.injectedKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://api.anthropic.com";
    this.apiVersion = options.apiVersion ?? "2023-06-01";
  }

  async complete(input: ProviderCompleteInput): Promise<ProviderCompleteResult> {
    const apiKey = this.resolveApiKey();
    if (!apiKey) {
      throw new ProviderError(
        "PROVIDER_TOKEN_NOT_CONFIGURED",
        "Set ANTHROPIC_API_KEY or ANTHROPIC_API_KEY_FILE on the server.",
      );
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": this.apiVersion,
        },
        body: JSON.stringify({
          model: input.model,
          max_tokens: input.maxTokens,
          system: input.systemPrompt,
          messages: input.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
    } catch {
      // Network-layer failure (DNS, connection refused, abort). We do
      // NOT forward the original error's message to the detail field,
      // because that field is persisted on TaskRun.errorDetail and
      // rendered verbatim by the UI. Even though the native fetch does
      // not decorate errors with request headers today, any future
      // polyfill, proxy, or middleware could break that assumption —
      // and the x-api-key value is the single most sensitive thing in
      // this module. A fixed, scrubbed string is defense in depth.
      throw new ProviderError("PROVIDER_API_ERROR", "network error");
    }

    if (response.ok) {
      const body = (await response.json()) as AnthropicMessagesResponse;
      return {
        provider: "anthropic",
        model: body.model ?? input.model,
        text: extractText(body),
        stopReason: body.stop_reason ?? null,
      };
    }

    const detail = await safeReadErrorBody(response);
    throw new ProviderError(
      mapStatusToCode(response.status),
      detail,
      response.status,
    );
  }

  private resolveApiKey(): string | null {
    if (this.injectedKey && this.injectedKey.length > 0) {
      return this.injectedKey;
    }
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey && envKey.length > 0) {
      return envKey;
    }
    const filePath = process.env.ANTHROPIC_API_KEY_FILE;
    if (filePath && filePath.length > 0) {
      try {
        const raw = readFileSync(filePath, "utf8").trim();
        return raw.length > 0 ? raw : null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

type AnthropicMessagesResponse = {
  model?: string;
  stop_reason?: string | null;
  content?: Array<{ type: string; text?: string }>;
};

function extractText(body: AnthropicMessagesResponse): string {
  const blocks = body.content ?? [];
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === "text" && typeof block.text === "string") {
      parts.push(block.text);
    }
  }
  return parts.join("\n");
}

async function safeReadErrorBody(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    return body?.error?.message ?? body?.message ?? null;
  } catch {
    return null;
  }
}

function mapStatusToCode(status: number): "PROVIDER_UNAUTHORIZED" | "PROVIDER_RATE_LIMITED" | "PROVIDER_API_ERROR" {
  if (status === 401 || status === 403) return "PROVIDER_UNAUTHORIZED";
  if (status === 429) return "PROVIDER_RATE_LIMITED";
  return "PROVIDER_API_ERROR";
}
