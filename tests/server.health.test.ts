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

  it("returns status=degraded with the error message when the db ping throws an Error", async () => {
    const result = await checkHealth(async () => {
      throw new Error("connect ECONNREFUSED");
    });
    expect(result.status).toBe("degraded");
    expect(result.db).toBe("error");
    if (result.status === "degraded") {
      expect(result.error).toBe("connect ECONNREFUSED");
    }
  });

  it("stringifies non-Error thrown values in the error field", async () => {
    const result = await checkHealth(async () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw "string error";
    });
    expect(result.status).toBe("degraded");
    if (result.status === "degraded") {
      expect(result.error).toBe("string error");
    }
  });
});
