import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { Project } from "../../domain/project/schema";

interface StudioCutDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
}

let dbPromise: Promise<IDBPDatabase<StudioCutDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<StudioCutDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StudioCutDB>("studiocut-souayah", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}
