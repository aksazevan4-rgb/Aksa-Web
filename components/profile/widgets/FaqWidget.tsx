"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  items: FaqItem[];
  accentHex?: string;
}

/**
 * components/profile/widgets/FaqWidget.tsx
 * Accordion. Data stored in User.widgetConfig:
 *   { faq: { enabled: true, config: { items: FaqItem[] } } }
 */
export function FaqWidget({ items, accentHex = "#9b6dff" }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question + i} className="glass rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-sm font-medium text-text-primary">{item.question}</span>
              <ChevronDown
                size={15}
                style={{ color: accentHex }}
                className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-3.5 text-xs text-text-tertiary leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
