"use client";

import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { ExperienceForm, ExperienceFormData } from "./ExperienceForm";
import { deleteExperience, reorderExperience } from "./actions";

function formatRange(start: string, end: string | null, current: boolean) {
  const startLabel = new Date(start).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
  if (current || !end) return `${startLabel} — Sekarang`;
  const endLabel = new Date(end).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
  return `${startLabel} — ${endLabel}`;
}

export function ExperienceClient({
  entries: initialEntries,
}: {
  entries: ExperienceFormData[];
}) {
  const [items, setItems] = useState(initialEntries);
  const [editing, setEditing] = useState<ExperienceFormData | null | "new">(
    null
  );
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
      void reorderExperience(next.map((e) => e.id!));
    });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setItems((prev) => prev.filter((e) => e.id !== id));
    startTransition(() => {
      void deleteExperience(id);
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
          Tambah Riwayat
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-12">
          Belum ada riwayat pengalaman.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((entry, index) => (
            <div
              key={entry.id}
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
                  <p className="text-sm font-medium text-text-primary">
                    {entry.role}
                  </p>
                  {entry.company && (
                    <span className="text-xs text-text-tertiary">
                      {entry.company}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-purple mt-0.5">
                  {formatRange(entry.startDate, entry.endDate, entry.current)}
                </p>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {entry.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditing(entry)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-blue hover:bg-blue/10 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(entry.id!)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                    confirmDeleteId === entry.id
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
        <ExperienceForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
