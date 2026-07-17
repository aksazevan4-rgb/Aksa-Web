"use client";

import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { TechStackForm, TechStackFormData } from "./TechStackForm";
import { deleteTechStackItem, reorderTechStackItems } from "./actions";

export function TechStackClient({
  items: initialItems,
}: {
  items: TechStackFormData[];
}) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<TechStackFormData | null | "new">(
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
      void reorderTechStackItems(next.map((t) => t.id!));
    });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
    startTransition(() => {
      void deleteTechStackItem(id);
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
          Tambah Tech
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-12">
          Belum ada tech stack item.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {items.map((item, index) => (
            <div
              key={item.id}
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
                <p className="text-sm font-medium text-text-primary truncate">
                  {item.name}
                </p>
                {item.category && (
                  <p className="text-[10px] text-text-tertiary">
                    {item.category}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => setEditing(item)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-blue hover:bg-blue/10 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(item.id!)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors ${
                    confirmDeleteId === item.id
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
        <TechStackForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
