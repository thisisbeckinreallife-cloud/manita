import { describe, expect, it } from "vitest";
import { checkHealth } from "@/server/health";

describe("checkHealth", () => {
  it("returns status=ok when the db ping resolves", async () => {
    const result = await checkHealth(async () => {
      // success
    });
    expect(result.status).toBe("ok");
    expect(result.db).toBe("ok");
    expect(typeof result.checkedAt).toBe("string");
    expect(Number.isNaN(Date.parse(result.checkedAt))).toBe(false);
  });

  it("returns status=degraded when the db ping throws an Error", async () => {
    const result = await checkHealth(async () => {
      throw new Error("connect ECONNREFUSED");
    });
    expect(result.status).toBe("degraded");
    expect(result.db).toBe("error");
    expect(typeof result.checkedAt).toBe("string");
  });

  it("returns status=degraded for non-Error thrown values too", async () => {
    const result = await checkHealth(async () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw "string error";
    });
    expect(result.status).toBe("degraded");
    expect(result.db).toBe("error");
  });

  it("does not leak the raw error message onto the public result shape", async () => {
    const result = await checkHealth(async () => {
      throw new Error(
        "password authentication failed for user \"vibe\" on host 10.0.0.5:5432",
      );
    });
    // The public shape has no `error` field — anything that would have
    // been the Prisma/pg message must be absent from the JSON body the
    // route handler serializes.
    expect(result).not.toHaveProperty("error");
    expect(JSON.stringify(result)).not.toContain("10.0.0.5");
    expect(JSON.stringify(result)).not.toContain("password authentication");
  });
});
