"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { MAX_COMPARE } from "@/lib/compare";
import { useCompare, type CompareItem } from "./CompareProvider";

/**
 * "Jämför" checkbox on a product card or product page. Picking a fifth
 * house shows a short note instead of silently doing nothing.
 */
export default function CompareToggle({
  item,
  className = "",
}: {
  item: CompareItem;
  className?: string;
}) {
  const { isSelected, toggle } = useCompare();
  const [fullNote, setFullNote] = useState(false);
  const selected = isSelected(item.id);

  useEffect(() => {
    if (!fullNote) return;
    const timer = window.setTimeout(() => setFullNote(false), 2500);
    return () => window.clearTimeout(timer);
  }, [fullNote]);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        onClick={(event) => {
          // Cards can sit inside a stretched link; don't navigate.
          event.preventDefault();
          event.stopPropagation();
          if (!toggle(item)) setFullNote(true);
        }}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
          selected
            ? "border-brand bg-brand text-white"
            : "border-line bg-white text-ink hover:border-brand hover:text-brand"
        }`}
      >
        <Icon name={selected ? "check" : "compare"} size={16} />
        {selected ? "Jämförs" : "Jämför"}
      </button>
      {fullNote && (
        <span
          role="status"
          className="absolute bottom-full left-0 z-20 mb-2 w-56 rounded-md bg-ink px-3 py-2 text-xs text-white shadow-lg"
        >
          Du kan jämföra högst {MAX_COMPARE} hus. Ta bort ett först.
        </span>
      )}
    </span>
  );
}
