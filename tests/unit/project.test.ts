import { describe, it, expect } from "vitest";
import { createProject } from "../../src/domain/project/schema";
import { validateProject } from "../../src/domain/project/validate";

describe("project schema", () => {
  it("creates a valid project", () => {
    const p = createProject("Demo");
    const r = validateProject(p);
    expect(r.ok).toBe(true);
  });

  it("rejects unknown schema version", () => {
    const r = validateProject({ schemaVersion: 999 });
    expect(r.ok).toBe(false);
  });

  it("rejects non-object input", () => {
    const r = validateProject("nope");
    expect(r.ok).toBe(false);
  });

  it("rejects project with no id", () => {
    const p = createProject("Demo");
    const r = validateProject({ ...p, id: "" });
    expect(r.ok).toBe(false);
  });
});
