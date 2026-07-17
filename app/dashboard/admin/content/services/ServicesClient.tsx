"use client";

import { useState, useTransition } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { ServiceForm, ServiceFormData } from "./ServiceForm";
import { deleteService, reorderServices } from "./actions";

export function ServicesClient({
  services: initialServices,
}: {
  services: ServiceFormData[];
}) {
  const [items, setItems] = useState(initialServices);
  const [editing, setEditing] = useState<ServiceFormData | null | "new">(null);
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
      void reorderServices(next.map((s) => s.id!));
    });
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setItems((prev) => prev.filter((s) => s.id !== id));
    startTransition(() => {
      void deleteService(id);
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
          Tambah Layanan
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-12">
          Belum ada layanan.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((service, index) => (
            <div
              key={service.id}
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
                <p className="text-sm font-medium text-text-primary">
                  {service.title}
                </p>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditing(service)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-blue hover:bg-blue/10 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(service.id!)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                    confirmDeleteId === service.id
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
        <ServiceForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
