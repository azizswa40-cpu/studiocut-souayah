import type { TimelineState, Clip } from "./types";

export interface Command {
  execute(state: TimelineState): void;
  undo(state: TimelineState): void;
}

/**
 * Trim a clip by modifying its duration and source in/out points.
 */
export class TrimCommand implements Command {
  private trackId: string;
  private clipId: string;
  private newDuration: number;
  private newSourceIn: number;
  private newSourceOut: number;
  private previousState: Clip | null = null;
  private trackIndex: number = -1;
  private clipIndex: number = -1;

  constructor(
    trackId: string,
    clipId: string,
    newDuration: number,
    newSourceIn: number,
    newSourceOut: number
  ) {
    this.trackId = trackId;
    this.clipId = clipId;
    this.newDuration = newDuration;
    this.newSourceIn = newSourceIn;
    this.newSourceOut = newSourceOut;
  }

  execute(state: TimelineState): void {
    this.trackIndex = state.tracks.findIndex((t) => t.id === this.trackId);
    if (this.trackIndex === -1) throw new Error("Track not found");
    
    const track = state.tracks[this.trackIndex];
    this.clipIndex = track.clips.findIndex((c) => c.id === this.clipId);
    if (this.clipIndex === -1) throw new Error("Clip not found");

    // Save previous state for undo
    this.previousState = { ...track.clips[this.clipIndex] };

    // Apply new state
    const clip = track.clips[this.clipIndex];
    clip.durationFrames = this.newDuration;
    clip.sourceInFrame = this.newSourceIn;
    clip.sourceOutFrame = this.newSourceOut;
  }

  undo(state: TimelineState): void {
    if (!this.previousState) return;
    const track = state.tracks[this.trackIndex];
    if (track && track.clips[this.clipIndex]) {
      track.clips[this.clipIndex] = { ...this.previousState };
    }
  }
}

/**
 * History manager to handle undo/redo stacks.
 */
export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  execute(command: Command, state: TimelineState): void {
    command.execute(state);
    this.undoStack.push(command);
    this.redoStack = []; // Clear redo stack on new action
  }

  undo(state: TimelineState): void {
    const command = this.undoStack.pop();
    if (command) {
      command.undo(state);
      this.redoStack.push(command);
    }
  }

  redo(state: TimelineState): void {
    const command = this.redoStack.pop();
    if (command) {
      command.execute(state);
      this.undoStack.push(command);
    }
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
