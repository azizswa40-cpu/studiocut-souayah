import { describe, it, expect } from "vitest";
import {
  framesToSeconds,
  secondsToFrames,
  addFrames,
  subtractFrames,
  parseTimecode,
  formatTimecode,
} from "../../src/domain/timeline/frames";

describe("frame math", () => {
  const fps30 = { num: 30, den: 1 };
  const fps25 = { num: 25, den: 1 };
  const fpsNtsc = { num: 30000, den: 1001 }; // 29.97 fps

  describe("framesToSeconds", () => {
    it("converts frames to seconds correctly at 30fps", () => {
      expect(framesToSeconds(30, fps30)).toBe(1);
      expect(framesToSeconds(15, fps30)).toBe(0.5);
    });

    it("converts frames to seconds correctly at 25fps", () => {
      expect(framesToSeconds(25, fps25)).toBe(1);
    });

    it("converts frames to seconds correctly at 29.97fps", () => {
      expect(framesToSeconds(30000, fpsNtsc)).toBeCloseTo(1001, 2);
    });
  });

  describe("secondsToFrames", () => {
    it("converts seconds to frames correctly at 30fps", () => {
      expect(secondsToFrames(1, fps30)).toBe(30);
      expect(secondsToFrames(0.5, fps30)).toBe(15);
    });

    it("converts seconds to frames correctly at 29.97fps", () => {
      expect(secondsToFrames(1001, fpsNtsc)).toBe(30000);
    });
  });

  describe("addFrames and subtractFrames", () => {
    it("adds frames", () => {
      expect(addFrames(10, 5)).toBe(15);
    });
    it("subtracts frames", () => {
      expect(subtractFrames(10, 5)).toBe(5);
    });
  });

  describe("parseTimecode", () => {
    it("parses a valid timecode at 30fps", () => {
      // 1 hour, 2 minutes, 3 seconds, 4 frames = 3600 + 120 + 3 = 3723 seconds * 30 + 4 = 111694
      expect(parseTimecode("01:02:03:04", fps30)).toBe(111694);
    });

    it("parses a valid timecode at 25fps", () => {
      expect(parseTimecode("00:00:10:05", fps25)).toBe(255); // 10 * 25 + 5 = 255
    });

    it("throws on invalid timecode format", () => {
      expect(() => parseTimecode("00:00:10", fps30)).toThrow();
      expect(() => parseTimecode("invalid", fps30)).toThrow();
    });
  });

  describe("formatTimecode", () => {
    it("formats frames to timecode at 30fps", () => {
      expect(formatTimecode(111694, fps30)).toBe("01:02:03:04");
    });

    it("formats frames to timecode at 25fps", () => {
      expect(formatTimecode(255, fps25)).toBe("00:00:10:05");
    });

    it("handles zero frames", () => {
      expect(formatTimecode(0, fps30)).toBe("00:00:00:00");
    });

    it("handles negative frames safely", () => {
      expect(formatTimecode(-5, fps30)).toBe("00:00:00:00");
    });
  });
});
