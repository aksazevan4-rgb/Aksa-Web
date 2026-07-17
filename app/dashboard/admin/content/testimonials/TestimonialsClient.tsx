"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { TestimonialForm, TestimonialFormData } from "./TestimonialForm";
import { deleteTestimonial, reorderTestimonials } from "./actions";

export function TestimonialsClient({
  testimonials,
}: {
  testimonials: TestimonialFormData[];
}) {
  const [items, setItems] = useState(testimonials);
  const [editing, setEditing] = useState<TestimonialFormData | null | "new">(
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
      void reorderTestimonials(next.map((t) => t.id!));
    });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
    startTransition(() => {
      void deleteTestimonial(id);
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
          Tambah Testimoni
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-12">
          Belum ada testimoni.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((t, index) => (
            <div
              key={t.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="flex items-start gap-3 glass rounded-xl p-4"
            >
              <GripVertical
                size={16}
                className="text-text-tertiary cursor-grab shrink-0 mt-1"
              />
              {t.avatarUrl ? (
                <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 bg-white/5">
                  <Image
                    src={t.avatarUrl}
                    alt={t.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-white/5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-text-primary">
                    {t.name}
                  </p>
                  {t.role && (
                    <span className="text-xs text-text-tertiary">
                      {t.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-1.5">
                  {t.content}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditing(t)}
                  title="Edit"
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-blue hover:bg-blue/10 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(t.id!)}
                  onBlur={() => setConfirmDeleteId(null)}
                  title={
                    confirmDeleteId === t.id
                      ? "Klik sekali lagi untuk hapus permanen"
                      : "Hapus"
                  }
                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                    confirmDeleteId === t.id
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
        <TestimonialForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
