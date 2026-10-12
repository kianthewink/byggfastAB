"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/admin/icons";
import { localPrice } from "@/lib/build/pricing";
import type { ExactPrices, Municipality } from "@/lib/build/types";

const currency = new Intl.NumberFormat("sv-SE");

/**
 * Optional exact price per kommun for one package or option. A blank field
 * means "use base price × the kommun's factor", shown as the placeholder so
 * you can see what the visitor gets today.
 */
export function ExactPricesEditor({
  basePrice,
  value,
  onChange,
  municipalities,
}: {
  basePrice: number;
  value: ExactPrices;
  onChange: (next: ExactPrices) => void;
  municipalities: Municipality[];
}) {
  const [open, setOpen] = useState(false);
  const count = Object.keys(value).length;

  if (municipalities.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-medium text-panel-muted hover:text-foreground"
      >
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
        Exakta priser per kommun{count > 0 ? ` (${count} angivna)` : ""}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-card/50 p-3 sm:grid-cols-3 lg:grid-cols-4">
          <p className="col-span-full text-xs text-panel-muted">
            Lämna tomt för att använda grundpris × kommunens prisfaktor (visas
            i grått).
          </p>
          {municipalities.map((m) => (
            <label
              key={m.id}
              className="flex flex-col gap-1 text-xs font-medium text-panel-muted"
            >
              {m.name}
              <input
                type="number"
                min={0}
                value={value[m.id] ?? ""}
                placeholder={currency.format(localPrice(basePrice, {}, m))}
                onChange={(e) => {
                  const next = { ...value };
                  const n = Number(e.target.value);
                  if (e.target.value.trim() === "" || !Number.isFinite(n)) {
                    delete next[m.id];
                  } else {
                    next[m.id] = Math.max(0, Math.round(n));
                  }
                  onChange(next);
                }}
                className="w-full rounded-lg border border-border bg-card px-2 py-1 text-sm outline-none focus:border-accent"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
