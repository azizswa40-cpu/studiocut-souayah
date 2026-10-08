export type MediaType = "video" | "audio" | "image";

export interface MediaAsset {
  id: string;
  projectId: string;
  name: string;
  type: MediaType;
  mimeType: string;
  size: number;
  duration?: number; // seconds, for video/audio
  width?: number;    // for video/image
  height?: number;   // for video/image
  createdAt: string;
  fileBlob: Blob;    // the actual file data
}

export function mediaTypeFromMime(mime: string): MediaType | null {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("image/")) return "image";
  return null;
}
