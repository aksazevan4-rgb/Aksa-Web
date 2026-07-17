"use client";

import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { StatForm, StatFormData } from "./StatForm";
import { deleteStat, reorderStats } from "./actions";

export function StatsClient({ stats: initialStats }: { stats: StatFormData[] }) {
  const [items, setItems] = useState(initialStats);
  const [editing, setEditing] = useState<StatFormData | null | "new">(null);
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
      void reorderStats(next.map((s) => s.id!));
    });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setItems((prev) => prev.filter((s) => s.id !== id));
    startTransition(() => {
      void deleteStat(id);
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
          Tambah Statistik
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-12">
          Belum ada statistik.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {items.map((stat, index) => (
            <div
              key={stat.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="flex items-center gap-2 glass rounded-xl p-3 transition-opacity"
            >
              <GripVertical
                size={14}
                className="text-text-tertiary cursor-grab shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {stat.value}
                </p>
                <p className="text-[11px] text-text-tertiary truncate">
                  {stat.label}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => setEditing(stat)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-blue hover:bg-blue/10 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(stat.id!)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors ${
                    confirmDeleteId === stat.id
                      ? "text-red-400 bg-red-400/10"
                      : "text-text-tertiary hover:text-red-400 hover:bg-red-400/10"
                  }`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <StatForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
