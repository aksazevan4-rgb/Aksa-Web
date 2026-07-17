"use client";

import { useState, useTransition } from "react";
import { Reorder } from "framer-motion";
import { Crown, GripVertical, Loader2 } from "lucide-react";
import { WIDGET_REGISTRY } from "@/lib/widget-registry";
import { toggleWidget, reorderWidgets } from "./actions";

interface Props {
  widgetConfig: Record<string, { enabled: boolean; order: number }> | null;
  accessibleFeatures: string[];
}

export function WidgetManager({ widgetConfig, accessibleFeatures }: Props) {
  const [pending, startTransition] = useTransition();

  // Build the working list: merge registry defaults with stored config, sorted by order.
  const initialList = [...WIDGET_REGISTRY]
    .map((w) => ({
      ...w,
      enabled: widgetConfig?.[w.key]?.enabled ?? w.defaultEnabled,
      order: widgetConfig?.[w.key]?.order ?? w.defaultOrder,
    }))
    .sort((a, b) => a.order - b.order);

  const [items, setItems] = useState(initialList);

  function handleToggle(key: string, current: boolean) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, enabled: !current } : item))
    );
    startTransition(async () => {
      const result = await toggleWidget(key, !current);
      if (result?.error) {
        // Revert on failure (e.g. premium gate rejected server-side)
        setItems((prev) =>
          prev.map((item) => (item.key === key ? { ...item, enabled: current } : item))
        );
      }
    });
  }

  function handleReorder(newOrder: typeof items) {
    setItems(newOrder);
    startTransition(async () => {
      await reorderWidgets(newOrder.map((item) => item.key));
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Widget</h3>
          <p className="text-xs text-text-tertiary mt-1">
            Aktifkan widget yang ingin ditampilkan. Drag untuk mengatur urutan.
          </p>
        </div>
        {pending && <Loader2 size={14} className="animate-spin text-purple" />}
      </div>

      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
        {items.map((widget) => {
          const locked =
            widget.premiumFeatureKey && !accessibleFeatures.includes(widget.premiumFeatureKey);

          return (
            <Reorder.Item
              key={widget.key}
              value={widget}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 select-none ${
                widget.enabled
                  ? "border-purple/25 bg-purple/5"
                  : "border-border bg-white/3"
              }`}
            >
              <GripVertical size={15} className="text-text-tertiary cursor-grab flex-shrink-0 active:cursor-grabbing" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-text-primary truncate">{widget.label}</p>
                  {locked && <Crown size={11} className="text-amber-300 flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-text-tertiary truncate">{widget.description}</p>
              </div>

              <button
                type="button"
                disabled={Boolean(locked)}
                onClick={() => handleToggle(widget.key, widget.enabled)}
                className={`relative flex-shrink-0 inline-block h-6 w-11 rounded-full transition-colors ${
                  widget.enabled ? "bg-purple" : "bg-white/10"
                } ${locked ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    widget.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
