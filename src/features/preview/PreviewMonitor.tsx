import { useEffect, useMemo, useRef, useState } from "react";
import type { MediaAsset } from "../../domain/media/types";

type Props = {
  asset: MediaAsset | null;
};

export function PreviewMonitor({ asset }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Derive the object URL from the asset (pure derivation, no setState).
  const url = useMemo(() => {
    if (!asset) return null;
    return URL.createObjectURL(asset.fileBlob);
  }, [asset]);

  // Revoke the previous URL when it changes or on unmount.
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  // Keep player UI in sync with the media element.
  useEffect(() => {
    const el = videoRef.current || audioRef.current;
    if (!el) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(el.currentTime);
    const onLoaded = () => setDuration(el.duration || 0);
    const onEnded = () => setPlaying(false);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("durationchange", onLoaded);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("durationchange", onLoaded);
      el.removeEventListener("ended", onEnded);
    };
  }, [url]);

  function togglePlay() {
    const el = videoRef.current || audioRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }

  function seek(value: number) {
    const el = videoRef.current || audioRef.current;
    if (!el) return;
    el.currentTime = value;
    setCurrentTime(value);
  }

  if (!asset || !url) {
    return (
      <div
        style={{
          flex: 1,
          background: "#111",
          color: "#666",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}
      >
        Select a media asset to preview
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#111", minHeight: 0 }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          padding: 12,
        }}
      >
        {asset.type === "video" && (
          <video
            ref={videoRef}
            src={url}
            style={{ maxWidth: "100%", maxHeight: "100%", background: "#000" }}
            onClick={togglePlay}
          />
        )}
        {asset.type === "audio" && (
          <div style={{ textAlign: "center", color: "#eee" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>♪</div>
            <div style={{ fontSize: 13, color: "#aaa" }}>{asset.name}</div>
            <audio ref={audioRef} src={url} style={{ display: "none" }} />
          </div>
        )}
        {asset.type === "image" && (
          <img
            src={url}
            alt={asset.name}
            style={{ maxWidth: "100%", maxHeight: "100%", background: "#000" }}
          />
        )}
      </div>

      {(asset.type === "video" || asset.type === "audio") && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: "#1a1a1a",
            borderTop: "1px solid #222",
          }}
        >
          <button
            onClick={togglePlay}
            style={{
              width: 40,
              height: 32,
              cursor: "pointer",
              background: "#333",
              color: "#eee",
              border: "none",
              borderRadius: 4,
            }}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <span style={{ color: "#aaa", fontSize: 12, minWidth: 90, textAlign: "right" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
