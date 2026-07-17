"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { togglePlanFeature, updatePlanPrice } from "./actions";

interface FeatureRow {
  id: string;
  key: string;
  label: string;
  description: string | null;
  category: string | null;
}

interface PlanRow {
  id: string;
  name: string;
  label: string;
  price: number;
  discountPct: number;
  durationDays: number | null;
  isActive: boolean;
  features: { feature: FeatureRow }[];
}

interface Props {
  initialPlans: PlanRow[];
  allFeatures: FeatureRow[];
}

export function PremiumPlansClient({ initialPlans, allFeatures }: Props) {
  const [plans, setPlans] = useState(initialPlans);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(plans[0]?.id ?? null);
  const [pending, startTransition] = useTransition();
  const [editingPrice, setEditingPrice] = useState<string | null>(null);

  const featuresByCategory = allFeatures.reduce<Record<string, FeatureRow[]>>((acc, f) => {
    const cat = f.category ?? "Lainnya";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  function isFeatureEnabled(plan: PlanRow, featureId: string) {
    return plan.features.some((pf) => pf.feature.id === featureId);
  }

  function handleToggle(planId: string, featureId: string, currentlyEnabled: boolean) {
    // Optimistic update
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        if (currentlyEnabled) {
          return { ...p, features: p.features.filter((pf) => pf.feature.id !== featureId) };
        }
        const feature = allFeatures.find((f) => f.id === featureId)!;
        return { ...p, features: [...p.features, { feature }] };
      })
    );

    startTransition(async () => {
      await togglePlanFeature(planId, featureId, !currentlyEnabled);
    });
  }

  function handlePriceUpdate(planId: string, price: number, discountPct: number) {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, price, discountPct } : p))
    );
    startTransition(async () => {
      await updatePlanPrice(planId, price, discountPct);
    });
    setEditingPrice(null);
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const expanded = expandedPlan === plan.id;
        return (
          <div key={plan.id} className="glass rounded-2xl overflow-hidden">
            {/* Plan header */}
            <button
              onClick={() => setExpandedPlan(expanded ? null : plan.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-display font-semibold text-text-primary text-sm">
                    {plan.label}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                    {plan.discountPct > 0 && ` · ${plan.discountPct}% off`}
                    {" · "}
                    {plan.features.length} fitur aktif
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-text-tertiary transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            {expanded && (
              <div className="border-t border-border p-5 space-y-5">
                {/* Price editor */}
                <div className="flex items-center gap-3">
                  {editingPrice === plan.id ? (
                    <PriceEditor
                      plan={plan}
                      onSave={(price, discount) => handlePriceUpdate(plan.id, price, discount)}
                      onCancel={() => setEditingPrice(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingPrice(plan.id)}
                      className="text-xs text-purple hover:underline"
                    >
                      Edit harga & diskon
                    </button>
                  )}
                </div>

                {/* Features grouped by category */}
                {Object.entries(featuresByCategory).map(([category, features]) => (
                  <div key={category}>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-text-tertiary mb-2">
                      {category}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {features.map((feature) => {
                        const enabled = isFeatureEnabled(plan, feature.id);
                        return (
                          <button
                            key={feature.id}
                            onClick={() => handleToggle(plan.id, feature.id, enabled)}
                            disabled={pending}
                            className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs transition-all ${
                              enabled
                                ? "border-purple/30 bg-purple/8 text-text-primary"
                                : "border-border bg-white/3 text-text-tertiary hover:border-border/80"
                            }`}
                          >
                            <span className="truncate">{feature.label}</span>
                            <span
                              className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${
                                enabled ? "bg-purple text-white" : "bg-white/10"
                              }`}
                            >
                              {enabled ? <Check size={10} /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {pending && (
        <div className="fixed bottom-6 right-6 glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-text-secondary shadow-lg">
          <Loader2 size={13} className="animate-spin text-purple" />
          Menyimpan perubahan...
        </div>
      )}
    </div>
  );
}

function PriceEditor({
  plan,
  onSave,
  onCancel,
}: {
  plan: PlanRow;
  onSave: (price: number, discount: number) => void;
  onCancel: () => void;
}) {
  const [price, setPrice] = useState(plan.price);
  const [discount, setDiscount] = useState(plan.discountPct);

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-28 rounded-lg bg-white/5 border border-border px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-purple/40"
        placeholder="Harga"
      />
      <input
        type="number"
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value))}
        className="w-20 rounded-lg bg-white/5 border border-border px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-purple/40"
        placeholder="% off"
      />
      <button
        onClick={() => onSave(price, discount)}
        className="h-7 w-7 rounded-lg bg-emerald-400/15 text-emerald-300 flex items-center justify-center hover:bg-emerald-400/25 transition-colors"
      >
        <Check size={13} />
      </button>
      <button
        onClick={onCancel}
        className="h-7 w-7 rounded-lg bg-white/5 text-text-tertiary flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}
