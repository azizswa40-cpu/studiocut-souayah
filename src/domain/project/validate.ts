import type { Project } from "./schema";
import { SCHEMA_VERSION } from "./schema";

export type ValidationResult =
  | { ok: true; project: Project }
  | { ok: false; error: string };

export function validateProject(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Project must be an object" };
  }
  const p = input as Partial<Project>;

  if (p.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, error: `Unsupported schema version: ${String(p.schemaVersion)}` };
  }
  if (typeof p.id !== "string" || p.id.length === 0) {
    return { ok: false, error: "Missing project id" };
  }
  if (typeof p.name !== "string" || p.name.length === 0) {
    return { ok: false, error: "Missing project name" };
  }
  if (
    !p.frameRate ||
    typeof p.frameRate.num !== "number" ||
    typeof p.frameRate.den !== "number" ||
    p.frameRate.num <= 0 ||
    p.frameRate.den <= 0
  ) {
    return { ok: false, error: "Invalid frameRate" };
  }
  if (typeof p.width !== "number" || typeof p.height !== "number") {
    return { ok: false, error: "Invalid resolution" };
  }
  if (typeof p.createdAt !== "string" || typeof p.updatedAt !== "string") {
    return { ok: false, error: "Invalid timestamps" };
  }
  return { ok: true, project: p as Project };
}
