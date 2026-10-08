import { useState } from "react";
import type { Project } from "../../domain/project/schema";
import type { MediaAsset } from "../../domain/media/types";
import { MediaBin } from "../media-bin/MediaBin";
import { PreviewMonitor } from "../preview/PreviewMonitor";

type Props = {
  project: Project;
  onBack: () => void;
};

export function Editor({ project, onBack }: Props) {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #ddd",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ padding: "6px 12px", cursor: "pointer" }}>
            ← Back
          </button>
          <strong>{project.name}</strong>
          <span style={{ color: "#888", fontSize: 12 }}>
            {project.width}×{project.height} · {project.frameRate.num}/{project.frameRate.den} fps
          </span>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside style={{ width: 260, borderRight: "1px solid #ddd", padding: 12, background: "#fbfbfb", overflowY: "auto" }}>
          <MediaBin
            projectId={project.id}
            selectedId={selectedAsset?.id ?? null}
            onSelect={setSelectedAsset}
          />
        </aside>

        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <PreviewMonitor key={selectedAsset?.id ?? "empty"} asset={selectedAsset} />

          <section
            style={{
              height: 220,
              borderTop: "1px solid #ddd",
              background: "#f7f7f7",
              padding: 12,
              overflow: "auto",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 13, textTransform: "uppercase", color: "#666" }}>
              Timeline
            </h3>
            <div
              style={{
                height: 120,
                background: "#fff",
                border: "1px dashed #ccc",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: 13,
              }}
            >
              Timeline UI arrives in Step 21
            </div>
          </section>
        </main>

        <aside style={{ width: 260, borderLeft: "1px solid #ddd", padding: 12, background: "#fbfbfb" }}>
          <h3 style={{ marginTop: 0, fontSize: 13, textTransform: "uppercase", color: "#666" }}>Properties</h3>
          <p style={{ color: "#aaa", fontSize: 13 }}>Clip properties appear once a clip is selected.</p>
        </aside>
      </div>
    </div>
  );
}
