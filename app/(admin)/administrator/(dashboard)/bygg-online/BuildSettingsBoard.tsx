"use client";

import { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/admin/icons";
import { ExactPricesEditor } from "@/components/admin/build/ExactPricesEditor";
import { IconButton } from "@/components/admin/listing/PackagesField";
import { inputClass, labelClass, newId } from "@/components/admin/form-styles";
import type {
  BuildCatalog,
  BuildCategory,
  BuildGroup,
  BuildOption,
  Municipality,
} from "@/lib/build/types";
import { resetBuildSettingsAction, saveBuildSettingsAction } from "./actions";

interface Settings {
  catalog: BuildCatalog;
  municipalities: Municipality[];
}

const currency = new Intl.NumberFormat("sv-SE");

function replaceAt<T>(items: T[], index: number, item: T): T[] {
  return items.map((existing, i) => (i === index ? item : existing));
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index);
}

function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/**
 * Admin editor for everything behind the product pages' purchase box and
 * Bygg online: kommuner with their price factor, and the tabs → categories
 * → options catalog. Edited locally, saved as a whole.
 */
export function BuildSettingsBoard({ initial }: { initial: Settings }) {
  const [saved, setSaved] = useState<Settings>(initial);
  const [draft, setDraft] = useState<Settings>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved]
  );

  const setCatalog = (catalog: BuildCatalog) => setDraft((d) => ({ ...d, catalog }));
  const setGroups = (groups: BuildGroup[]) => setCatalog({ groups });
  const setMunicipalities = (municipalities: Municipality[]) =>
    setDraft((d) => ({ ...d, municipalities }));

  const run = async (action: () => Promise<Settings>, successText: string) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await action();
      setSaved(result);
      setDraft(result);
      setMessage({ ok: true, text: successText });
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Kunde inte spara.",
      });
    } finally {
      setIsSaving(false);
      setConfirmingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border bg-background/95 px-8 py-6 backdrop-blur sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Bygg online</h1>
          <p className="max-w-2xl text-sm text-panel-muted">
            Kommuner och alla val i Bygg online på produktsidorna. Ändringar
            syns publikt så fort du sparar. Köpalternativ och deras priser
            ställs in per annons under Innehåll.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* A success note is stale the moment anything changes again; an
              error stays until the next attempt. */}
          {message && (!message.ok || !isDirty) && (
            <span className={`text-sm ${message.ok ? "text-emerald-600" : "text-rose-600"}`}>
              {message.text}
            </span>
          )}
          {isDirty && message?.ok !== false && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600">
              Osparade ändringar
            </span>
          )}
          {confirmingReset ? (
            <>
              <span className="text-sm text-panel-muted">Ersätta allt med exempeldata?</span>
              <button
                type="button"
                onClick={() => run(resetBuildSettingsAction, "Återställt till exempeldata.")}
                disabled={isSaving}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Återställ
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-panel"
              >
                Avbryt
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-panel-muted hover:bg-panel hover:text-foreground"
            >
              Återställ till exempeldata
            </button>
          )}
          <button
            type="button"
            onClick={() => setDraft(saved)}
            disabled={!isDirty || isSaving}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-panel disabled:opacity-40"
          >
            Ångra ändringar
          </button>
          <button
            type="button"
            onClick={() => run(() => saveBuildSettingsAction(draft), "Sparat.")}
            disabled={!isDirty || isSaving}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40"
          >
            {isSaving ? "Sparar…" : "Spara"}
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-8 px-8 py-8">
        <MunicipalitiesEditor
          municipalities={draft.municipalities}
          onChange={setMunicipalities}
        />

        <section>
          <h2 className="mb-1 text-sm font-semibold">Flikar, kategorier och val</h2>
          <p className="mb-4 max-w-2xl text-xs text-panel-muted">
            Varje flik blir ett steg i Bygg online. En kategori är antingen
            &rdquo;ett val&rdquo; (första valet är förvalt) eller &rdquo;flera
            val&rdquo; (kryssrutor, t.ex. Tillval). Priser är grundpriser och
            justeras efter kommun.
          </p>
          <div className="space-y-4">
            {draft.catalog.groups.map((group, gi) => (
              <GroupEditor
                key={group.id}
                group={group}
                municipalities={draft.municipalities}
                isFirst={gi === 0}
                isLast={gi === draft.catalog.groups.length - 1}
                onChange={(next) => setGroups(replaceAt(draft.catalog.groups, gi, next))}
                onMove={(delta) => setGroups(moveItem(draft.catalog.groups, gi, delta))}
                onRemove={() => setGroups(removeAt(draft.catalog.groups, gi))}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setGroups([
                ...draft.catalog.groups,
                { id: newId("flik"), name: "Ny flik", categories: [] },
              ])
            }
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80"
          >
            <PlusIcon className="h-4 w-4" />
            Lägg till flik
          </button>
        </section>
      </main>
    </div>
  );
}

function MunicipalitiesEditor({
  municipalities,
  onChange,
}: {
  municipalities: Municipality[];
  onChange: (next: Municipality[]) => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
      <h2 className="mb-1 text-sm font-semibold">Kommuner ({municipalities.length})</h2>
      <p className="mb-4 max-w-2xl text-xs text-panel-muted">
        Prisjusteringen gäller alla priser i kommunen (0 % = grundpris). Den är
        en tillfällig modell — exakta priser per kommun kan anges på varje
        köpalternativ och val, och går då före.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs text-panel-muted">
              <th className="pb-2 font-medium">Kommun</th>
              <th className="pb-2 font-medium">Prisjustering (%)</th>
              <th className="pb-2 font-medium">Exempel</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {municipalities.map((m, i) => {
              const percent = Math.round((m.priceFactor - 1) * 1000) / 10;
              return (
                <tr key={m.id} className="border-t border-border">
                  <td className="py-2 pr-3">
                    <input
                      value={m.name}
                      onChange={(e) =>
                        onChange(replaceAt(municipalities, i, { ...m, name: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="w-40 py-2 pr-3">
                    <input
                      type="number"
                      step="0.5"
                      min={-90}
                      max={500}
                      value={percent}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n)) return;
                        onChange(
                          replaceAt(municipalities, i, {
                            ...m,
                            priceFactor: Math.max(0.1, 1 + n / 100),
                          })
                        );
                      }}
                      className={inputClass}
                    />
                  </td>
                  <td className="py-2 pr-3 text-xs text-panel-muted">
                    100 000 kr → {currency.format(Math.round(100000 * m.priceFactor))} kr
                  </td>
                  <td className="w-24 py-2 text-right">
                    <div className="flex justify-end">
                      <IconButton label="Flytta upp" onClick={() => onChange(moveItem(municipalities, i, -1))} disabled={i === 0}>
                        <ChevronLeftIcon className="h-4 w-4 rotate-90" />
                      </IconButton>
                      <IconButton
                        label={`Ta bort ${m.name}`}
                        onClick={() => onChange(removeAt(municipalities, i))}
                        danger
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() =>
          onChange([
            ...municipalities,
            { id: newId("kommun"), name: "Ny kommun", priceFactor: 1 },
          ])
        }
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80"
      >
        <PlusIcon className="h-4 w-4" />
        Lägg till kommun
      </button>
    </section>
  );
}

function GroupEditor({
  group,
  municipalities,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  group: BuildGroup;
  municipalities: Municipality[];
  isFirst: boolean;
  isLast: boolean;
  onChange: (next: BuildGroup) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const optionCount = group.categories.reduce((n, c) => n + c.options.length, 0);
  const setCategories = (categories: BuildCategory[]) => onChange({ ...group, categories });

  return (
    <div className="rounded-xl border border-border bg-panel text-panel-foreground">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fäll ihop" : "Fäll ut"}
          className="text-panel-muted hover:text-foreground"
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <input
          value={group.name}
          onChange={(e) => onChange({ ...group, name: e.target.value })}
          aria-label="Fliknamn"
          className={`${inputClass} max-w-xs font-semibold`}
        />
        <span className="flex-1 text-xs text-panel-muted">
          {group.categories.length} kategorier · {optionCount} val
        </span>
        <IconButton label="Flytta upp" onClick={() => onMove(-1)} disabled={isFirst}>
          <ChevronLeftIcon className="h-4 w-4 rotate-90" />
        </IconButton>
        <IconButton label="Flytta ner" onClick={() => onMove(1)} disabled={isLast}>
          <ChevronRightIcon className="h-4 w-4 rotate-90" />
        </IconButton>
        <IconButton label={`Ta bort fliken ${group.name}`} onClick={onRemove} danger>
          <TrashIcon className="h-4 w-4" />
        </IconButton>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {group.categories.map((category, ci) => (
            <CategoryEditor
              key={category.id}
              category={category}
              municipalities={municipalities}
              isFirst={ci === 0}
              isLast={ci === group.categories.length - 1}
              onChange={(next) => setCategories(replaceAt(group.categories, ci, next))}
              onMove={(delta) => setCategories(moveItem(group.categories, ci, delta))}
              onRemove={() => setCategories(removeAt(group.categories, ci))}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setCategories([
                ...group.categories,
                {
                  id: newId("kategori"),
                  name: "Ny kategori",
                  description: "",
                  multiple: false,
                  options: [],
                },
              ])
            }
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80"
          >
            <PlusIcon className="h-4 w-4" />
            Lägg till kategori
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryEditor({
  category,
  municipalities,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  category: BuildCategory;
  municipalities: Municipality[];
  isFirst: boolean;
  isLast: boolean;
  onChange: (next: BuildCategory) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const setOptions = (options: BuildOption[]) => onChange({ ...category, options });

  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.5fr_auto_auto]">
        <label className={labelClass}>
          Kategori
          <input
            value={category.name}
            onChange={(e) => onChange({ ...category, name: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Beskrivning (valfri)
          <input
            value={category.description}
            onChange={(e) => onChange({ ...category, description: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Typ
          <select
            value={category.multiple ? "multiple" : "single"}
            onChange={(e) => onChange({ ...category, multiple: e.target.value === "multiple" })}
            className={inputClass}
          >
            <option value="single">Ett val</option>
            <option value="multiple">Flera val</option>
          </select>
        </label>
        <div className="flex items-end">
          <IconButton label="Flytta upp" onClick={() => onMove(-1)} disabled={isFirst}>
            <ChevronLeftIcon className="h-4 w-4 rotate-90" />
          </IconButton>
          <IconButton label="Flytta ner" onClick={() => onMove(1)} disabled={isLast}>
            <ChevronRightIcon className="h-4 w-4 rotate-90" />
          </IconButton>
          <IconButton label={`Ta bort ${category.name}`} onClick={onRemove} danger>
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {category.options.map((option, oi) => (
          <OptionEditor
            key={option.id}
            option={option}
            municipalities={municipalities}
            isDefault={!category.multiple && oi === 0}
            isFirst={oi === 0}
            isLast={oi === category.options.length - 1}
            onChange={(next) => setOptions(replaceAt(category.options, oi, next))}
            onMove={(delta) => setOptions(moveItem(category.options, oi, delta))}
            onRemove={() => setOptions(removeAt(category.options, oi))}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            setOptions([
              ...category.options,
              {
                id: newId("val"),
                name: "Nytt val",
                description: "",
                price: 0,
                swatch: null,
                exactPrices: {},
              },
            ])
          }
          className="flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80"
        >
          <PlusIcon className="h-4 w-4" />
          Lägg till val
        </button>
      </div>
    </div>
  );
}

function OptionEditor({
  option,
  municipalities,
  isDefault,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: {
  option: BuildOption;
  municipalities: Municipality[];
  isDefault: boolean;
  isFirst: boolean;
  isLast: boolean;
  onChange: (next: BuildOption) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-panel p-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_0.8fr_auto_1.6fr_auto]">
        <label className={labelClass}>
          <span>
            Val {isDefault && <span className="font-normal text-accent">(förvalt)</span>}
          </span>
          <input
            value={option.name}
            onChange={(e) => onChange({ ...option, name: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Grundpris (kr)
          <input
            type="number"
            min={0}
            value={option.price}
            onChange={(e) =>
              onChange({ ...option, price: Math.max(0, Math.round(Number(e.target.value) || 0)) })
            }
            className={inputClass}
          />
        </label>
        <div className={labelClass}>
          Färg
          <div className="flex h-[34px] items-center gap-2">
            <input
              type="color"
              value={option.swatch ?? "#ffffff"}
              onChange={(e) => onChange({ ...option, swatch: e.target.value })}
              aria-label="Färgprov"
              className={`h-8 w-10 cursor-pointer rounded border border-border bg-card ${option.swatch ? "" : "opacity-40"}`}
            />
            {option.swatch && (
              <button
                type="button"
                onClick={() => onChange({ ...option, swatch: null })}
                className="text-xs text-panel-muted hover:text-rose-600"
              >
                Ingen
              </button>
            )}
          </div>
        </div>
        <label className={labelClass}>
          Beskrivning (valfri)
          <input
            value={option.description}
            onChange={(e) => onChange({ ...option, description: e.target.value })}
            className={inputClass}
          />
        </label>
        <div className="flex items-end">
          <IconButton label="Flytta upp" onClick={() => onMove(-1)} disabled={isFirst}>
            <ChevronLeftIcon className="h-4 w-4 rotate-90" />
          </IconButton>
          <IconButton label="Flytta ner" onClick={() => onMove(1)} disabled={isLast}>
            <ChevronRightIcon className="h-4 w-4 rotate-90" />
          </IconButton>
          <IconButton label={`Ta bort ${option.name}`} onClick={onRemove} danger>
            <TrashIcon className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
      <ExactPricesEditor
        basePrice={option.price}
        value={option.exactPrices}
        onChange={(exactPrices) => onChange({ ...option, exactPrices })}
        municipalities={municipalities}
      />
    </div>
  );
}
