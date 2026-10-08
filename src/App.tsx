import { useEffect, useState } from "react";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Editor } from "./features/editor/Editor";
import { getProject } from "./infrastructure/persistence/projectRepository";
import type { Project } from "./domain/project/schema";

type View =
  | { name: "dashboard" }
  | { name: "editor"; project: Project };

export default function App() {
  const [view, setView] = useState<View>({ name: "dashboard" });

  useEffect(() => {
    // Placeholder for future URL routing
  }, [view]);

  async function openProject(id: string) {
    const project = await getProject(id);
    if (project) {
      setView({ name: "editor", project });
    }
  }

  if (view.name === "editor") {
    return <Editor project={view.project} onBack={() => setView({ name: "dashboard" })} />;
  }

  return <Dashboard onOpenProject={openProject} />;
}
