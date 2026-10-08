import { useEffect, useState } from "react";
import type { Project } from "../../domain/project/schema";
import { createProject } from "../../domain/project/schema";
import { getAllProjects, saveProject, deleteProject } from "../../infrastructure/persistence/projectRepository";

type Props = {
  onOpenProject: (id: string) => void;
};

export function Dashboard({ onOpenProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const all = await getAllProjects();
    all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setProjects(all);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const project = createProject(trimmed);
    await saveProject(project);
    setName("");
    await refresh();
  }

  async function handleDelete(id: string, projectName: string) {
    const confirmed = window.confirm(`Delete "${projectName}"? This cannot be undone.`);
    if (!confirmed) return;
    await deleteProject(id);
    await refresh();
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 4 }}>StudioCut Souayah</h1>
      <p style={{ color: "#666", marginTop: 0 }}>Local-first video editing and client delivery.</p>

      <div style={{ display: "flex", gap: 8, margin: "24px 0" }}>
        <input
          type="text"
          placeholder="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          style={{ flex: 1, padding: 10, fontSize: 14 }}
        />
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          style={{ padding: "10px 16px", fontSize: 14, cursor: name.trim() ? "pointer" : "not-allowed" }}
        >
          Create
        </button>
      </div>

      <h2 style={{ fontSize: 16, marginTop: 32 }}>Projects</h2>

      {loading && <p>Loading…</p>}

      {!loading && projects.length === 0 && (
        <p style={{ color: "#888" }}>No projects yet. Create your first one above.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {projects.map((p) => (
          <li
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              border: "1px solid #ddd",
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {p.width}×{p.height} · {p.frameRate.num}/{p.frameRate.den} fps · updated {new Date(p.updatedAt).toLocaleString()}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onOpenProject(p.id)} style={{ padding: "6px 12px", cursor: "pointer" }}>
                Open
              </button>
              <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: "6px 12px", cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
