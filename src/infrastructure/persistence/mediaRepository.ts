import { getDB } from "./db";
import type { MediaAsset } from "../../domain/media/types";

export async function saveMediaAsset(asset: MediaAsset): Promise<void> {
  const db = await getDB();
  await db.put("media", asset);
}

export async function getMediaForProject(projectId: string): Promise<MediaAsset[]> {
  const db = await getDB();
  return db.getAllFromIndex("media", "by-project", projectId);
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("media", id);
}
