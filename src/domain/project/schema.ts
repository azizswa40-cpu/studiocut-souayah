export const SCHEMA_VERSION = 1 as const;

export type FrameRate = {
  num: number;
  den: number;
};

export type Project = {
  id: string;
  name: string;
  schemaVersion: typeof SCHEMA_VERSION;
  frameRate: FrameRate;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
};

export function createProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    schemaVersion: SCHEMA_VERSION,
    frameRate: { num: 30, den: 1 },
    width: 1920,
    height: 1080,
    createdAt: now,
    updatedAt: now,
  };
}
