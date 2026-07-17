"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  name,
  id,
  placeholder,
  autoComplete,
  onChange,
}: {
  name: string;
  id: string;
  placeholder?: string;
  autoComplete?: string;
  onChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required
        className="w-full rounded-xl bg-white/5 border border-border px-4 py-3 pr-11 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
