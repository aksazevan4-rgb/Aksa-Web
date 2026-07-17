"use client";

import { getPasswordStrength } from "@/lib/validation";

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, colorClass } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score ? colorClass : "bg-white/10"
            }`}
          />
        ))}
      </div>
      {label && (
        <p className="text-[11px] text-text-tertiary mt-1">{label}</p>
      )}
    </div>
  );
}
