import { useEffect, useRef, useState } from "react";
import type { MediaAsset } from "../../domain/media/types";
import { mediaTypeFromMime } from "../../domain/media/types";
import {
  saveMediaAsset,
  getMediaForProject,
  deleteMediaAsset,
} from "../../infrastructure/persistence/mediaRepository";

type Props = {
  projectId: string;
  selectedId: string | null;
  onSelect: (asset: MediaAsset) => void;
};

export function MediaBin({ projectId, selectedId, onSelect }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function reload(projectIdToLoad: string) {
    const all = await getMediaForProject(projectIdToLoad);
    all.sort((a, b) => a.name.localeCompare(b.name));
    setAssets(all);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const all = await getMediaForProject(projectId);
      if (cancelled) return;
      all.sort((a, b) => a.name.localeCompare(b.name));
      setAssets(all);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImporting(true);
    for (const file of Array.from(files)) {
      const type = mediaTypeFromMime(file.type);
      if (!type) continue;

      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        projectId,
        name: file.name,
        type,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
        fileBlob: file,
      };

      if (type === "video" || type === "audio") {
        try {
          asset.duration = await readMediaDuration(file, type);
        } catch {
          // ignore
        }
      }

      if (type === "video" || type === "image") {
        try {
          const { width, height } = await readMediaDimensions(file, type);
          asset.width = width;
          asset.height = height;
        } catch {
          // ignore
        }
      }

      await saveMediaAsset(asset);
    }
    setImporting(false);
    await reload(projectId);
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(`Remove "${name}" from the media bin?`);
    if (!confirmed) return;
    await deleteMediaAsset(id);
    await reload(projectId);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginTop: 0, fontSize: 13, textTransform: "uppercase", color: "#666" }}>
          Media Bin
        </h3>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={importing}
          style={{ padding: "4px 8px", fontSize: 12, cursor: "pointer" }}
        >
          {importing ? "Importing…" : "Import"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {loading && <p style={{ color: "#888", fontSize: 13 }}>Loading…</p>}

      {!loading && assets.length === 0 && (
        <p style={{ color: "#aaa", fontSize: 13 }}>
          No media yet. Click Import to add video, audio, or images.
        </p>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0 0" }}>
        {assets.map((a) => {
          const isSelected = a.id === selectedId;
          return (
            <li
              key={a.id}
              onClick={() => onSelect(a)}
              style={{
                padding: "8px 10px",
                border: isSelected ? "1px solid #2c7be5" : "1px solid #e0e0e0",
                borderRadius: 4,
                marginBottom: 6,
                background: isSelected ? "#eaf2fd" : "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.name}
                </strong>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(a.id, a.name);
                  }}
                  style={{ fontSize: 11, padding: "2px 6px", cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
              <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>
                {a.type} · {(a.size / 1024 / 1024).toFixed(2)} MB
                {a.duration !== undefined ? ` · ${a.duration.toFixed(2)}s` : ""}
                {a.width && a.height ? ` · ${a.width}×${a.height}` : ""}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function readMediaDuration(file: File, kind: "video" | "audio"): Promise<number> {
  return new Promise((resolve, reject) => {
    const el = document.createElement(kind);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      resolve(el.duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(el.src);
      reject(new Error("Could not read duration"));
    };
    el.src = URL.createObjectURL(file);
  });
}

function readMediaDimensions(
  file: File,
  kind: "video" | "image"
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (kind === "video") {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        URL.revokeObjectURL(el.src);
        resolve({ width: el.videoWidth, height: el.videoHeight });
      };
      el.onerror = () => {
        URL.revokeObjectURL(el.src);
        reject(new Error("Could not read dimensions"));
      };
      el.src = URL.createObjectURL(file);
    } else {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Could not read dimensions"));
      };
      img.src = URL.createObjectURL(file);
    }
  });
}
