import type { FrameRate } from "../project/schema";

/**
 * Converts frames to seconds.
 */
export function framesToSeconds(frames: number, frameRate: FrameRate): number {
  if (frameRate.den === 0 || frameRate.num === 0) {
    throw new Error("Invalid frame rate: denominator and numerator must be non-zero");
  }
  return frames * (frameRate.den / frameRate.num);
}

/**
 * Converts seconds to frames. Rounds to the nearest integer to avoid floating-point drift.
 */
export function secondsToFrames(seconds: number, frameRate: FrameRate): number {
  if (frameRate.den === 0 || frameRate.num === 0) {
    throw new Error("Invalid frame rate: denominator and numerator must be non-zero");
  }
  return Math.round(seconds * (frameRate.num / frameRate.den));
}

/**
 * Adds two frame counts.
 */
export function addFrames(a: number, b: number): number {
  return a + b;
}

/**
 * Subtracts two frame counts (a - b).
 */
export function subtractFrames(a: number, b: number): number {
  return a - b;
}

/**
 * Parses a standard SMPTE timecode string (HH:MM:SS:FF) into a frame count.
 */
export function parseTimecode(timecode: string, frameRate: FrameRate): number {
  const parts = timecode.split(":").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) {
    throw new Error(`Invalid timecode format: ${timecode}. Expected HH:MM:SS:FF`);
  }
  const [hours, minutes, seconds, frames] = parts;
  const fps = frameRate.num / frameRate.den;
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return Math.round(totalSeconds * fps) + frames;
}

/**
 * Formats a frame count into a standard SMPTE timecode string (HH:MM:SS:FF).
 */
export function formatTimecode(frames: number, frameRate: FrameRate): string {
  if (frames < 0) frames = 0; // Clamp negative frames to 0
  const fps = Math.round(frameRate.num / frameRate.den);
  const totalSeconds = Math.floor(frames / fps);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const remainingFrames = frames % fps;

  const pad = (n: number, len: number = 2) => n.toString().padStart(len, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(remainingFrames)}`;
}
