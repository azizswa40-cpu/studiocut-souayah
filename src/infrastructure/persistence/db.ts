import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";
import type { Project } from "../../domain/project/schema";
import type { MediaAsset } from "../../domain/media/types";

interface StudioCutDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
  };
  media: {
    key: string;
    value: MediaAsset;
    indexes: { "by-project": string };
  };
}

let dbPromise: Promise<IDBPDatabase<StudioCutDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<StudioCutDB>> {
  if (!dbPromise) {
    dbPromise = openDB<StudioCutDB>("studiocut-souayah", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("projects")) {
          db.createObjectStore("projects", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("media")) {
          const store = db.createObjectStore("media", { keyPath: "id" });
          store.createIndex("by-project", "projectId");
        }
      },
    });
  }
  return dbPromise;
}
