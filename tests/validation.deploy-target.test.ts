import { describe, expect, it } from "vitest";
import { linkDeployTargetInput } from "@/lib/validation/deploy-target";

describe("linkDeployTargetInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = linkDeployTargetInput.safeParse({
      projectId: "p1",
      railwayProjectId: "prj_abc",
      railwayServiceId: "svc_xyz",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.railwayEnvironmentId).toBeUndefined();
    }
  });

  it("accepts an explicit environment id", () => {
    const result = linkDeployTargetInput.safeParse({
      projectId: "p1",
      railwayProjectId: "prj_abc",
      railwayServiceId: "svc_xyz",
      railwayEnvironmentId: "env_1",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.railwayEnvironmentId).toBe("env_1");
  });

  it("treats an empty environment id as undefined", () => {
    const result = linkDeployTargetInput.safeParse({
      projectId: "p1",
      railwayProjectId: "prj_abc",
      railwayServiceId: "svc_xyz",
      railwayEnvironmentId: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.railwayEnvironmentId).toBeUndefined();
  });

  it("rejects identifiers with invalid characters", () => {
    for (const field of [
      "railwayProjectId",
      "railwayServiceId",
    ] as const) {
      const base = {
        projectId: "p1",
        railwayProjectId: "prj_abc",
        railwayServiceId: "svc_xyz",
      };
      const bad = { ...base, [field]: "bad id with spaces" };
      const result = linkDeployTargetInput.safeParse(bad);
      expect(result.success, `${field} should reject spaces`).toBe(false);
    }
  });

  it("rejects missing projectId", () => {
    const result = linkDeployTargetInput.safeParse({
      projectId: "",
      railwayProjectId: "prj_abc",
      railwayServiceId: "svc_xyz",
    });
    expect(result.success).toBe(false);
  });
});
