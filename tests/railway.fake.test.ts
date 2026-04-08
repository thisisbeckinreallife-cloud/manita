import { describe, expect, it } from "vitest";
import { FakeRailwayAdapter } from "@/lib/railway/fake";
import { RailwayAdapterError } from "@/lib/railway/adapter";

describe("FakeRailwayAdapter", () => {
  it("returns a synthetic LIVE result with a preview URL by default", async () => {
    const adapter = new FakeRailwayAdapter();
    const result = await adapter.triggerDeploy({
      railwayProjectId: "prj_1",
      railwayServiceId: "svc_1",
      railwayEnvironmentId: "env_1",
      commitSha: null,
      branch: null,
    });
    expect(result.status).toBe("LIVE");
    expect(result.previewUrl).toBe("https://fake.railway.local/service");
    expect(result.externalId).toBe("fake-1");
    expect(adapter.calls).toHaveLength(1);
  });

  it("omits the preview URL when finalStatus is not LIVE", async () => {
    const adapter = new FakeRailwayAdapter({ finalStatus: "BUILDING" });
    const result = await adapter.triggerDeploy({
      railwayProjectId: "prj_1",
      railwayServiceId: "svc_1",
      railwayEnvironmentId: "env_1",
      commitSha: null,
      branch: null,
    });
    expect(result.status).toBe("BUILDING");
    expect(result.previewUrl).toBe(null);
  });

  it("throws the configured error code when failWith is set", async () => {
    const adapter = new FakeRailwayAdapter({
      failWith: "RAILWAY_UNAUTHORIZED",
    });
    await expect(
      adapter.triggerDeploy({
        railwayProjectId: "prj_1",
        railwayServiceId: "svc_1",
        railwayEnvironmentId: "env_1",
        commitSha: null,
        branch: null,
      }),
    ).rejects.toBeInstanceOf(RailwayAdapterError);
  });
});
