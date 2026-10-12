"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/admin/icons";
import { ExactPricesEditor } from "@/components/admin/build/ExactPricesEditor";
import {
  inputClass,
  labelClass,
  newId,
  sectionTitleClass,
} from "@/components/admin/form-styles";
import { DEFAULT_PACKAGES } from "@/lib/build/defaults";
import type { Municipality, PurchasePackage } from "@/lib/build/types";

/**
 * "Köpalternativ" for one product — the radio list in the purchase box on
 * its page. Each product has its own list and prices.
 */
export function PackagesField({
  packages,
  onChange,
  municipalities,
}: {
  packages: PurchasePackage[];
  onChange: (next: PurchasePackage[]) => void;
  municipalities: Municipality[];
}) {
  const [open, setOpen] = useState(false);

  const update = (index: number, patch: Partial<PurchasePackage>) =>
    onChange(packages.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= packages.length) return;
    const next = [...packages];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${sectionTitleClass} flex items-center gap-1.5 hover:text-foreground`}
      >
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
        Köpalternativ ({packages.length})
      </button>

      {open && (
        <div className="space-y-3 rounded-lg bg-card/50 p-3">
          <p className="text-xs text-panel-muted">
            Visas som val i köprutan på produktsidan. Priset är grundpris —
            det justeras automatiskt efter besökarens kommun.
          </p>

          {packages.map((pkg, i) => (
            <div key={pkg.id} className="space-y-3 rounded-lg border border-border bg-panel p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto]">
                <label className={labelClass}>
                  Namn
                  <input
                    value={pkg.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Grundpris (kr)
                  <input
                    type="number"
                    min={0}
                    value={pkg.price}
                    onChange={(e) =>
                      update(i, { price: Math.max(0, Math.round(Number(e.target.value) || 0)) })
                    }
                    className={inputClass}
                  />
                </label>
                <div className="flex items-end gap-1">
                  <IconButton label="Flytta upp" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ChevronLeftIcon className="h-4 w-4 rotate-90" />
                  </IconButton>
                  <IconButton
                    label="Flytta ner"
                    onClick={() => move(i, 1)}
                    disabled={i === packages.length - 1}
                  >
                    <ChevronRightIcon className="h-4 w-4 rotate-90" />
                  </IconButton>
                  <IconButton
                    label={`Ta bort ${pkg.name}`}
                    onClick={() => onChange(packages.filter((_, idx) => idx !== i))}
                    danger
                  >
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Kampanjtext (röd)
                  <input
                    value={pkg.campaign}
                    onChange={(e) => update(i, { campaign: e.target.value })}
                    placeholder="t.ex. Spara upp till 100 000 kr i okt"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Beskrivning (visas bakom ⓘ)
                  <input
                    value={pkg.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-panel-muted">
                <input
                  type="checkbox"
                  checked={pkg.configurable}
                  onChange={(e) => update(i, { configurable: e.target.checked })}
                  className="h-4 w-4 accent-[#22548F]"
                />
                Bygg online-tillval gäller för det här paketet
              </label>

              <ExactPricesEditor
                basePrice={pkg.price}
                value={pkg.exactPrices}
                onChange={(exactPrices) => update(i, { exactPrices })}
                municipalities={municipalities}
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() =>
                onChange([
                  ...packages,
                  {
                    id: newId("paket"),
                    name: "Nytt köpalternativ",
                    description: "",
                    campaign: "",
                    price: 0,
                    configurable: true,
                    exactPrices: {},
                  },
                ])
              }
              className="flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80"
            >
              <PlusIcon className="h-4 w-4" />
              Lägg till köpalternativ
            </button>
            {packages.length === 0 && (
              <button
                type="button"
                onClick={() => onChange(DEFAULT_PACKAGES)}
                className="text-sm font-medium text-accent hover:opacity-80"
              >
                Använd standardpaketen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-panel-muted transition-colors hover:bg-card disabled:opacity-30 ${
        danger ? "hover:text-rose-600" : "hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
