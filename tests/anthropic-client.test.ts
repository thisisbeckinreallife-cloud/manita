import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnthropicHttpClient } from "@/lib/providers/anthropic-client";
import { ProviderError } from "@/lib/providers/adapter";
import { FakeAnthropicClient } from "@/lib/providers/anthropic-fake";

function makeOkResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function makeErrResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AnthropicHttpClient", () => {
  const originalFetch = globalThis.fetch;
  const originalEnvKey = process.env.ANTHROPIC_API_KEY;
  const originalEnvFile = process.env.ANTHROPIC_API_KEY_FILE;

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY_FILE;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEnvKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalEnvKey;
    }
    if (originalEnvFile === undefined) {
      delete process.env.ANTHROPIC_API_KEY_FILE;
    } else {
      process.env.ANTHROPIC_API_KEY_FILE = originalEnvFile;
    }
  });

  it("throws PROVIDER_TOKEN_NOT_CONFIGURED when no key is resolvable", async () => {
    const client = new AnthropicHttpClient();
    await expect(
      client.complete({
        model: "claude-sonnet-4-6",
        systemPrompt: "system",
        messages: [{ role: "user", content: "hi" }],
        maxTokens: 100,
      }),
    ).rejects.toMatchObject({
      name: "ProviderError",
      code: "PROVIDER_TOKEN_NOT_CONFIGURED",
    });
  });

  it("builds the request body with model, system, messages, and max_tokens", async () => {
    const spy = vi.fn<(url: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
      async () =>
        makeOkResponse({
          model: "claude-sonnet-4-6",
          stop_reason: "end_turn",
          content: [{ type: "text", text: "hello back" }],
        }),
    );
    globalThis.fetch = spy as unknown as typeof fetch;

    const client = new AnthropicHttpClient({ apiKey: "sk-test-123" });
    await client.complete({
      model: "claude-sonnet-4-6",
      systemPrompt: "you are concise",
      messages: [
        { role: "user", content: "hi" },
        { role: "assistant", content: "hello" },
        { role: "user", content: "again" },
      ],
      maxTokens: 512,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const [url, init] = spy.mock.calls[0]!;
    expect(String(url)).toBe("https://api.anthropic.com/v1/messages");
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("sk-test-123");
    expect(headers["anthropic-version"]).toBe("2023-06-01");
    const body = JSON.parse(String(init?.body)) as {
      model: string;
      max_tokens: number;
      system: string;
      messages: Array<{ role: string; content: string }>;
    };
    expect(body.model).toBe("claude-sonnet-4-6");
    expect(body.max_tokens).toBe(512);
    expect(body.system).toBe("you are concise");
    expect(body.messages).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
      { role: "user", content: "again" },
    ]);
  });

  it("extracts joined text from content blocks", async () => {
    globalThis.fetch = (async () =>
      makeOkResponse({
        model: "claude-sonnet-4-6",
        stop_reason: "end_turn",
        content: [
          { type: "text", text: "first" },
          { type: "text", text: "second" },
          { type: "tool_use", id: "x" },
        ],
      })) as unknown as typeof fetch;

    const client = new AnthropicHttpClient({ apiKey: "sk-test-123" });
    const result = await client.complete({
      model: "claude-sonnet-4-6",
      systemPrompt: "s",
      messages: [{ role: "user", content: "hi" }],
      maxTokens: 100,
    });
    expect(result.text).toBe("first\nsecond");
    expect(result.stopReason).toBe("end_turn");
    expect(result.provider).toBe("anthropic");
  });

  it("maps HTTP 401 to PROVIDER_UNAUTHORIZED", async () => {
    globalThis.fetch = (async () =>
      makeErrResponse(401, { error: { message: "invalid api key" } })) as unknown as typeof fetch;

    const client = new AnthropicHttpClient({ apiKey: "sk-test-123" });
    await expect(
      client.complete({
        model: "claude-sonnet-4-6",
        systemPrompt: "s",
        messages: [{ role: "user", content: "hi" }],
        maxTokens: 100,
      }),
    ).rejects.toMatchObject({
      name: "ProviderError",
      code: "PROVIDER_UNAUTHORIZED",
      detail: "invalid api key",
      status: 401,
    });
  });

  it("maps HTTP 429 to PROVIDER_RATE_LIMITED", async () => {
    globalThis.fetch = (async () =>
      makeErrResponse(429, { error: { message: "slow down" } })) as unknown as typeof fetch;

    const client = new AnthropicHttpClient({ apiKey: "sk-test-123" });
    await expect(
      client.complete({
        model: "claude-sonnet-4-6",
        systemPrompt: "s",
        messages: [{ role: "user", content: "hi" }],
        maxTokens: 100,
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_RATE_LIMITED", status: 429 });
  });

  it("maps HTTP 500 to PROVIDER_API_ERROR", async () => {
    globalThis.fetch = (async () =>
      makeErrResponse(500, { error: { message: "upstream down" } })) as unknown as typeof fetch;

    const client = new AnthropicHttpClient({ apiKey: "sk-test-123" });
    await expect(
      client.complete({
        model: "claude-sonnet-4-6",
        systemPrompt: "s",
        messages: [{ role: "user", content: "hi" }],
        maxTokens: 100,
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_API_ERROR", status: 500 });
  });

  it("wraps network-layer failures as PROVIDER_API_ERROR", async () => {
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;

    const client = new AnthropicHttpClient({ apiKey: "sk-test-123" });
    const err = await client
      .complete({
        model: "claude-sonnet-4-6",
        systemPrompt: "s",
        messages: [{ role: "user", content: "hi" }],
        maxTokens: 100,
      })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ProviderError);
    expect((err as ProviderError).code).toBe("PROVIDER_API_ERROR");
    // The detail is a fixed, scrubbed string — we never forward the
    // original error's message, which could theoretically include
    // request-shaped data and leak the x-api-key header value.
    expect((err as ProviderError).detail).toBe("network error");
  });

  it("prefers injected key over env", async () => {
    process.env.ANTHROPIC_API_KEY = "env-key";
    const spy = vi.fn<(url: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
      async () =>
        makeOkResponse({
          model: "m",
          stop_reason: "end_turn",
          content: [{ type: "text", text: "ok" }],
        }),
    );
    globalThis.fetch = spy as unknown as typeof fetch;

    const client = new AnthropicHttpClient({ apiKey: "injected-key" });
    await client.complete({
      model: "claude-sonnet-4-6",
      systemPrompt: "s",
      messages: [{ role: "user", content: "hi" }],
      maxTokens: 100,
    });
    const headers = spy.mock.calls[0]![1]?.headers as Record<string, string>;
    expect(headers["x-api-key"]).toBe("injected-key");
  });
});

describe("FakeAnthropicClient", () => {
  it("returns the configured reply text and records the call", async () => {
    const client = new FakeAnthropicClient({ replyText: "ok sure" });
    const result = await client.complete({
      model: "claude-sonnet-4-6",
      systemPrompt: "s",
      messages: [{ role: "user", content: "hi" }],
      maxTokens: 100,
    });
    expect(result.text).toBe("ok sure");
    expect(result.provider).toBe("anthropic");
    expect(client.calls).toHaveLength(1);
    expect(client.calls[0]?.messages[0]?.content).toBe("hi");
  });

  it("throws the configured ProviderError code when failWith is set", async () => {
    const client = new FakeAnthropicClient({ failWith: "PROVIDER_UNAUTHORIZED" });
    await expect(
      client.complete({
        model: "claude-sonnet-4-6",
        systemPrompt: "s",
        messages: [{ role: "user", content: "hi" }],
        maxTokens: 100,
      }),
    ).rejects.toMatchObject({
      name: "ProviderError",
      code: "PROVIDER_UNAUTHORIZED",
    });
  });
});
