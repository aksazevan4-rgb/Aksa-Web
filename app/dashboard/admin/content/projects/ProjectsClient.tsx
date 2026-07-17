"use client";

import { useState, useTransition } from "react";
import {
  ExternalLink,
  GripVertical,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { ProjectForm, ProjectFormData } from "./ProjectForm";
import { deleteProject, reorderProjects } from "./actions";

export function ProjectsClient({
  projects,
}: {
  projects: ProjectFormData[];
}) {
  const [items, setItems] = useState(projects);
  const [editing, setEditing] = useState<ProjectFormData | null | "new">(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setItems(next);
    setDragIndex(null);
    startTransition(() => {
      void reorderProjects(next.map((p) => p.id!));
    });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
    startTransition(() => {
      void deleteProject(id);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Tambah Project
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-12">
          Belum ada project. Klik &quot;Tambah Project&quot; untuk mulai.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((project, index) => (
            <div
              key={project.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="flex items-center gap-3 glass rounded-xl p-4 transition-opacity"
            >
              <GripVertical
                size={16}
                className="text-text-tertiary cursor-grab shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {project.featured && (
                    <Star size={12} className="text-yellow-400 shrink-0" fill="currentColor" />
                  )}
                  <p className="text-sm font-medium text-text-primary">
                    {project.title}
                  </p>
                  <span className="text-[9px] font-mono bg-white/5 text-text-tertiary px-1.5 py-0.5 rounded border border-border uppercase">
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {project.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka URL"
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-purple hover:bg-purple/10 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  onClick={() => setEditing(project)}
                  title="Edit"
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-blue hover:bg-blue/10 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(project.id!)}
                  onBlur={() => setConfirmDeleteId(null)}
                  title={
                    confirmDeleteId === project.id
                      ? "Klik sekali lagi untuk hapus permanen"
                      : "Hapus"
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                    confirmDeleteId === project.id
                      ? "text-red-400 bg-red-400/10"
                      : "text-text-tertiary hover:text-red-400 hover:bg-red-400/10"
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ProjectForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
