import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  saveProject,
  getProject,
  getAllProjects,
  deleteProject,
} from "../../src/infrastructure/persistence/projectRepository";
import { createProject } from "../../src/domain/project/schema";
import { getDB } from "../../src/infrastructure/persistence/db";

describe("Project Repository (IndexedDB)", () => {
  beforeEach(async () => {
    // Clear the database before each test to ensure isolation
    const db = await getDB();
    await db.clear("projects");
  });

  it("saves and retrieves a project", async () => {
    const project = createProject("Test Project");
    await saveProject(project);

    const retrieved = await getProject(project.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("Test Project");
    expect(retrieved?.id).toBe(project.id);
  });

  it("gets all projects", async () => {
    const p1 = createProject("Project 1");
    const p2 = createProject("Project 2");
    await saveProject(p1);
    await saveProject(p2);

    const all = await getAllProjects();
    expect(all.length).toBe(2);
    expect(all.map((p) => p.name).sort()).toEqual(["Project 1", "Project 2"]);
  });

  it("deletes a project", async () => {
    const project = createProject("Test Project");
    await saveProject(project);

    await deleteProject(project.id);
    const retrieved = await getProject(project.id);
    expect(retrieved).toBeUndefined();
  });

  it("throws an error when saving an invalid project", async () => {
    const invalidProject = { name: "Invalid" } as unknown as ReturnType<typeof createProject>;
    await expect(saveProject(invalidProject)).rejects.toThrow("Cannot save invalid project");
  });
});
