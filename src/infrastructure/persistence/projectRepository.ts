import { getDB } from "./db";
import type { Project } from "../../domain/project/schema";
import { validateProject } from "../../domain/project/validate";

export async function saveProject(project: Project): Promise<void> {
  const validation = validateProject(project);
  if (!validation.ok) {
    throw new Error(`Cannot save invalid project: ${validation.error}`);
  }
  const db = await getDB();
  await db.put("projects", project);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get("projects", id);
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB();
  return db.getAll("projects");
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("projects", id);
}
