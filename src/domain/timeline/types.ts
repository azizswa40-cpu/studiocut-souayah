export interface Clip {
  id: string;
  trackId: string;
  startFrame: number;
  durationFrames: number;
  sourceInFrame: number;
  sourceOutFrame: number;
}

export interface Track {
  id: string;
  type: "video" | "audio" | "image";
  clips: Clip[];
}

export interface TimelineState {
  tracks: Track[];
}
