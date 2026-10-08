import { describe, it, expect, beforeEach } from "vitest";
import type { TimelineState } from "../../src/domain/timeline/types";
import { TrimCommand, CommandHistory } from "../../src/domain/timeline/commands";

describe("Timeline Commands", () => {
  let state: TimelineState;
  let history: CommandHistory;

  beforeEach(() => {
    // Set up a basic timeline with one video track and one clip
    state = {
      tracks: [
        {
          id: "track-1",
          type: "video",
          clips: [
            {
              id: "clip-1",
              trackId: "track-1",
              startFrame: 0,
              durationFrames: 100,
              sourceInFrame: 0,
              sourceOutFrame: 100,
            },
          ],
        },
      ],
    };
    history = new CommandHistory();
  });

  it("trims a clip and correctly undoes/redoes the action", () => {
    // Trim the clip from 100 frames to 50 frames
    const command = new TrimCommand("track-1", "clip-1", 50, 10, 60);
    
    // Execute
    history.execute(command, state);
    expect(state.tracks[0].clips[0].durationFrames).toBe(50);
    expect(state.tracks[0].clips[0].sourceInFrame).toBe(10);
    expect(state.tracks[0].clips[0].sourceOutFrame).toBe(60);

    // Undo
    history.undo(state);
    expect(state.tracks[0].clips[0].durationFrames).toBe(100);
    expect(state.tracks[0].clips[0].sourceInFrame).toBe(0);
    expect(state.tracks[0].clips[0].sourceOutFrame).toBe(100);

    // Redo
    history.redo(state);
    expect(state.tracks[0].clips[0].durationFrames).toBe(50);
    expect(state.tracks[0].clips[0].sourceInFrame).toBe(10);
  });

  it("throws an error if track or clip is not found", () => {
    const badTrack = new TrimCommand("bad-track", "clip-1", 50, 10, 60);
    expect(() => history.execute(badTrack, state)).toThrow("Track not found");

    const badClip = new TrimCommand("track-1", "bad-clip", 50, 10, 60);
    expect(() => history.execute(badClip, state)).toThrow("Clip not found");
  });
});
