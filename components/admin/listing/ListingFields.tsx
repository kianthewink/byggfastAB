"use client";

import { useRef, useState } from "react";
import { ChevronDownIcon, ClockIcon, PlusIcon, TrashIcon } from "@/components/admin/icons";
import type { Listing, Viewing } from "@/lib/db/schema";
import {
  uploadListingDocumentAction,
  uploadListingImageAction,
} from "@/lib/actions/upload";
import {
  INSTALLATION_SECTIONS,
  TECH_SPEC_SECTIONS,
  type ListingDocument,
  type SpecSection,
  type SpecKey,
} from "@/lib/listings/spec-sections";
import type { Municipality } from "@/lib/build/types";
import {
  inputClass,
  labelClass,
  sectionTitleClass,
} from "@/components/admin/form-styles";
import { PackagesField } from "./PackagesField";

function numToInput(n: number | null | undefined): string {
  return n === null || n === undefined ? "" : String(n);
}

function inputToNullableNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function inputToNum(v: string, fallback: number): number {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) ? n : fallback;
}

/**
 * All listing inputs as one controlled component, shared by the Content
 * card editor and the Create page.
 *
 * `variant` decides where the identity fields live: when creating, city /
 * type / id are essential and sit up top; when editing an existing
 * listing they're rarely touched, so they move into "Övriga uppgifter" with
 * the rest of the rarely-corrected data.
 */
export function ListingFields({
  value,
  onChange,
  storageNote = null,
  variant = "edit",
  onUploadError,
  onUploadingChange,
  municipalities,
}: {
  value: Listing;
  onChange: (next: Listing) => void;
  /** Surfaced under the image picker when storage needs attention. */
  storageNote?: string | null;
  variant?: "create" | "edit";
  onUploadError?: (message: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  /** For the per-kommun exact prices on the purchase packages. */
  municipalities: Municipality[];
}) {
  const [newAmenity, setNewAmenity] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCreate = variant === "create";

  const setField = <K extends keyof Listing>(key: K, fieldValue: Listing[K]) => {
    onChange({ ...value, [key]: fieldValue });
  };

  const handleAddImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.set("file", file);
          const { url } = await uploadListingImageAction(formData);
          return url;
        })
      );
      setField("images", [...value.images, ...uploaded]);
    } catch (err) {
      onUploadError?.(err instanceof Error ? err.message : "Uppladdningen misslyckades.");
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  const addAmenity = () => {
    const amenity = newAmenity.trim();
    if (!amenity) return;
    setField("amenities", [...value.amenities, amenity]);
    setNewAmenity("");
  };

  const updateViewing = (index: number, field: keyof Viewing, next: string) => {
    setField(
      "viewings",
      value.viewings.map((v, i) => (i === index ? { ...v, [field]: next } : v))
    );
  };

  const identityFields = (
    <>
      <label className={labelClass}>
        Ort
        <input
          value={value.city}
          onChange={(e) => setField("city", e.target.value)}
          placeholder="t.ex. Ljungby"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Typ av annons
        <select
          value={value.listingType}
          onChange={(e) =>
            setField("listingType", e.target.value as Listing["listingType"])
          }
          className={inputClass}
        >
          <option value="attefallshus">Attefallshus</option>
          <option value="attefallshus_med_kallare">
            Attefallshus med källare
          </option>
        </select>
      </label>
    </>
  );

  return (
    <div className="space-y-5">
      {isCreate && (
        <div>
          <h4 className={sectionTitleClass}>Grunduppgifter</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {identityFields}
          </div>
        </div>
      )}

      <div>
        <h4 className={sectionTitleClass}>Viktigaste uppgifterna</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <label className={labelClass}>
            Rum
            <input
              type="number"
              min={0}
              step={1}
              value={numToInput(value.rooms)}
              onChange={(e) => setField("rooms", inputToNum(e.target.value, value.rooms))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Yta (m&sup2;)
            <input
              type="number"
              min={0}
              value={numToInput(value.area)}
              onChange={(e) => setField("area", inputToNum(e.target.value, value.area))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Yta max (m&sup2;)
            <input
              type="number"
              min={0}
              placeholder="—"
              value={numToInput(value.areaMax)}
              onChange={(e) => setField("areaMax", inputToNullableNum(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Hyra (kr/m&aring;n)
            <input
              type="number"
              min={0}
              value={numToInput(value.rent)}
              onChange={(e) => setField("rent", inputToNum(e.target.value, value.rent))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Inflyttning
            <input
              type="date"
              value={value.available ?? ""}
              onChange={(e) => setField("available", e.target.value || null)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <div>
        <h4 className={sectionTitleClass}>Mått</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              { key: "loftArea", label: "Loft (m²)" },
              { key: "length", label: "Längd (m)" },
              { key: "width", label: "Bredd (m)" },
              { key: "height", label: "Höjd (m)" },
              { key: "bedrooms", label: "Sovrum" },
            ] as const
          ).map(({ key, label }) => (
            <label key={key} className={labelClass}>
              {label}
              <input
                type="number"
                min={0}
                step={key === "bedrooms" ? 1 : "any"}
                placeholder="—"
                value={numToInput(value[key])}
                onChange={(e) => setField(key, inputToNullableNum(e.target.value))}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      </div>

      <PackagesField
        packages={value.packages}
        onChange={(next) => setField("packages", next)}
        municipalities={municipalities}
      />

      <DocumentsField
        documents={value.documents}
        onChange={(next) => setField("documents", next)}
        onUploadError={onUploadError}
        onUploadingChange={onUploadingChange}
      />

      <SpecSectionsField
        title="Teknisk specifikation"
        sections={TECH_SPEC_SECTIONS}
        value={value}
        onChange={(key, items) => setField(key, items)}
      />

      <SpecSectionsField
        title="Installation & montering"
        sections={INSTALLATION_SECTIONS}
        value={value}
        onChange={(key, items) => setField(key, items)}
      />

      <div>
        <h4 className={sectionTitleClass}>Bekvämligheter</h4>
        <div className="flex flex-wrap items-center gap-2">
          {value.amenities.map((amenity, i) => (
            <span
              key={`${amenity}-${i}`}
              className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs"
            >
              {amenity}
              <button
                type="button"
                onClick={() =>
                  setField(
                    "amenities",
                    value.amenities.filter((_, idx) => idx !== i)
                  )
                }
                aria-label={`Ta bort ${amenity}`}
                className="text-panel-muted hover:text-rose-600"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAmenity();
              }
            }}
            placeholder="Lägg till"
            className="w-32 rounded-lg border border-border bg-card px-2.5 py-1 text-xs outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={addAmenity}
            className="flex items-center gap-1 text-xs font-medium text-accent hover:opacity-80"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Lägg till
          </button>
        </div>
      </div>

      <div>
        <h4 className={sectionTitleClass}>Bilder</h4>
        <div className="flex flex-wrap gap-2">
          {value.images.map((src) => (
            <div
              key={src}
              className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() =>
                  setField(
                    "images",
                    value.images.filter((img) => img !== src)
                  )
                }
                aria-label="Ta bort bild"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-panel-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="text-xs">
              {isUploading ? "Laddar upp…" : "Lägg till bild"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleAddImages(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {storageNote && (
          <p className="mt-1.5 text-xs text-amber-600">{storageNote}</p>
        )}
      </div>

      <div>
        <h4 className={sectionTitleClass}>Beskrivning</h4>
        <textarea
          value={value.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={5}
          className="w-full resize-y rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>

      <div>
        <h4 className={sectionTitleClass}>Visningstider</h4>
        <div className="space-y-2">
          {value.viewings.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 shrink-0 text-panel-muted" />
              <input
                value={v.date}
                onChange={(e) => updateViewing(i, "date", e.target.value)}
                placeholder="t.ex. Sön 9 aug"
                className="w-36 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-accent"
              />
              <input
                value={v.time}
                onChange={(e) => updateViewing(i, "time", e.target.value)}
                placeholder="t.ex. 15:10–15:40"
                className="w-36 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() =>
                  setField(
                    "viewings",
                    value.viewings.filter((_, idx) => idx !== i)
                  )
                }
                aria-label="Ta bort visningstid"
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-panel-muted transition-colors hover:bg-card hover:text-rose-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setField("viewings", [...value.viewings, { date: "", time: "" }])
            }
            className="flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80"
          >
            <PlusIcon className="h-4 w-4" />
            Lägg till visningstid
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-panel-muted hover:text-foreground"
        >
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`}
          />
          Övriga uppgifter
          {isCreate ? " (våning, hiss…)" : " (typ, våning, hiss…)"}
        </button>

        {showDetails && (
          <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-card/50 p-3 sm:grid-cols-3">
            {!isCreate && identityFields}
            <label className={labelClass}>
              Våning
              <input
                type="number"
                placeholder="—"
                value={numToInput(value.floor)}
                onChange={(e) => setField("floor", inputToNullableNum(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Antal våningar
              <input
                type="number"
                placeholder="—"
                value={numToInput(value.floorsTotal)}
                onChange={(e) =>
                  setField("floorsTotal", inputToNullableNum(e.target.value))
                }
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Hiss
              <select
                value={
                  value.elevator === null ? "unknown" : value.elevator ? "yes" : "no"
                }
                onChange={(e) =>
                  setField(
                    "elevator",
                    e.target.value === "unknown" ? null : e.target.value === "yes"
                  )
                }
                className={inputClass}
              >
                <option value="unknown">Okänt</option>
                <option value="yes">Ja</option>
                <option value="no">Nej</option>
              </select>
            </label>
            <label className={labelClass}>
              Byggår
              <input
                type="number"
                placeholder="—"
                value={numToInput(value.buildYear)}
                onChange={(e) => setField("buildYear", inputToNullableNum(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Källsamling
              <input
                placeholder="—"
                value={value.sourceCollection ?? ""}
                onChange={(e) => setField("sourceCollection", e.target.value || null)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Kontakter
              <input
                placeholder="—"
                value={value.contacts ?? ""}
                onChange={(e) => setField("contacts", e.target.value || null)}
                className={inputClass}
              />
            </label>
            {!isCreate && (
              <div className={labelClass}>
                Id
                <p className="truncate rounded-lg bg-panel px-2.5 py-1.5 font-mono text-xs text-panel-muted">
                  {value.id}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** PDFs shown in the product page's "Dokument" side panel. */
function DocumentsField({
  documents,
  onChange,
  onUploadError,
  onUploadingChange,
}: {
  documents: ListingDocument[];
  onChange: (next: ListingDocument[]) => void;
  onUploadError?: (message: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    onUploadingChange?.(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.set("file", file);
          const { url } = await uploadListingDocumentAction(formData);
          // The filename minus ".pdf" is a sensible default display name.
          return { name: file.name.replace(/\.pdf$/i, ""), url };
        })
      );
      onChange([...documents, ...uploaded]);
    } catch (err) {
      onUploadError?.(err instanceof Error ? err.message : "Uppladdningen misslyckades.");
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div>
      <h4 className={sectionTitleClass}>Dokument (PDF)</h4>
      <div className="space-y-2">
        {documents.map((doc, i) => (
          <div key={`${doc.url}-${i}`} className="flex items-center gap-2">
            <input
              value={doc.name}
              onChange={(e) =>
                onChange(
                  documents.map((d, idx) =>
                    idx === i ? { ...d, name: e.target.value } : d
                  )
                )
              }
              placeholder="Namn, t.ex. Planritning"
              className="w-48 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-accent"
            />
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate font-mono text-xs text-panel-muted hover:text-accent hover:underline"
            >
              {doc.url}
            </a>
            <button
              type="button"
              onClick={() => onChange(documents.filter((_, idx) => idx !== i))}
              aria-label={`Ta bort ${doc.name}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-panel-muted transition-colors hover:bg-card hover:text-rose-600"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-sm font-medium text-accent hover:opacity-80 disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          {isUploading ? "Laddar upp…" : "Ladda upp PDF"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

/**
 * One textarea per accordion section; each line becomes one entry in that
 * section's array. Collapsed by default — it's a lot of fields.
 */
function SpecSectionsField({
  title,
  sections,
  value,
  onChange,
}: {
  title: string;
  sections: readonly SpecSection[];
  value: Listing;
  onChange: (key: SpecKey, items: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const filled = sections.filter(({ key }) => value[key].some((s) => s.trim())).length;

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
        {title} ({filled}/{sections.length} ifyllda)
      </button>
      {open && (
        <div className="grid grid-cols-1 gap-3 rounded-lg bg-card/50 p-3 lg:grid-cols-2">
          <p className="text-xs text-panel-muted lg:col-span-2">
            En rad per punkt. En enda rad visas som löptext, flera rader som
            numrerad lista.
          </p>
          {sections.map(({ key, label }) => (
            <label key={key} className={labelClass}>
              {label}
              <textarea
                value={value[key].join("\n")}
                onChange={(e) => onChange(key, e.target.value.split("\n"))}
                rows={4}
                className="w-full resize-y rounded-lg border border-border bg-card p-2.5 text-sm font-normal text-foreground outline-none focus:border-accent"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
