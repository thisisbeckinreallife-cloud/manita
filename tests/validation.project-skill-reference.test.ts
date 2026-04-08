import { describe, expect, it } from "vitest";
import { createProjectSkillReferenceInput } from "@/lib/validation/project-skill-reference";

describe("createProjectSkillReferenceInput", () => {
  it("accepts a minimal valid payload", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      projectId: "p1",
      name: "brief-to-spec",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("brief-to-spec");
      expect(result.data.source).toBeUndefined();
    }
  });

  it("preserves an explicit source", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      projectId: "p1",
      name: "brief-to-spec",
      source: "file:///.claude/skills/brief-to-spec",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe("file:///.claude/skills/brief-to-spec");
    }
  });

  it("trims whitespace from name", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      projectId: "p1",
      name: "  brief  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("brief");
  });

  it("treats empty source as undefined", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      projectId: "p1",
      name: "brief",
      source: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.source).toBeUndefined();
  });

  it("rejects an empty name", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      projectId: "p1",
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 120 characters", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      projectId: "p1",
      name: "x".repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a source longer than 500 characters", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      projectId: "p1",
      name: "n",
      source: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing projectId", () => {
    const result = createProjectSkillReferenceInput.safeParse({
      name: "n",
    });
    expect(result.success).toBe(false);
  });
});
