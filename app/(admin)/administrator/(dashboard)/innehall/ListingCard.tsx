"use client";

import { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ImagePlaceholderIcon,
  TrashIcon,
} from "@/components/admin/icons";
import {
  currency,
  formatArea,
  listingTypeLabel,
} from "@/components/admin/listing/format";
import { ListingFields } from "@/components/admin/listing/ListingFields";
import type { Listing } from "@/lib/db/schema";
import type { Municipality } from "@/lib/build/types";

export function ListingCard({
  listing,
  onSave,
  onDelete,
  storageNote,
  municipalities,
}: {
  listing: Listing;
  onSave: (listing: Listing) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  storageNote: string | null;
  municipalities: Municipality[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Listing>(listing);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(listing),
    [draft, listing]
  );

  const handleSaveClose = async () => {
    if (!isDirty) {
      setIsEditing(false);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await onSave(draft);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte spara.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await onDelete(listing.id);
      // On success the parent removes this listing and the card unmounts —
      // no local state to reset.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte ta bort.");
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-panel text-panel-foreground">
      <button
        type="button"
        onClick={() => setIsEditing((v) => !v)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-card">
          {listing.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-panel-muted">
              <ImagePlaceholderIcon className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{listing.city}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                listing.listingType === "attefallshus"
                  ? "bg-accent text-accent-foreground"
                  : "bg-sidebar text-sidebar-foreground"
              }`}
            >
              {listingTypeLabel(listing.listingType)}
            </span>
            {isDirty && (
              <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                Osparat
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-panel-muted">
            {listing.rooms} rum &middot; {formatArea(listing)} &middot;{" "}
            {currency.format(listing.rent)} kr/m&aring;n
          </p>
        </div>

        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-panel-muted transition-transform ${
            isEditing ? "rotate-180" : ""
          }`}
        />
      </button>

      {isEditing && (
        <div className="space-y-5 border-t border-border p-4">
          <ListingFields
            value={draft}
            onChange={setDraft}
            storageNote={storageNote}
            variant="edit"
            onUploadError={setError}
            onUploadingChange={setIsUploading}
            municipalities={municipalities}
          />

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          {confirmingDelete ? (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-rose-600">
                Ta bort annonsen permanent? Det går inte att ångra.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isDeleting}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-card disabled:opacity-50"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirmed}
                  disabled={isDeleting}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isDeleting ? "Tar bort…" : "Ta bort"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-sm font-medium text-rose-600 transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                <TrashIcon className="h-4 w-4" />
                Ta bort annons
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(listing);
                    setError(null);
                  }}
                  disabled={!isDirty || isSaving}
                  className="text-sm font-medium text-panel-muted transition-colors hover:text-foreground disabled:opacity-40"
                >
                  Återställ ändringar
                </button>
                <button
                  type="button"
                  onClick={handleSaveClose}
                  disabled={isSaving || isUploading}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? "Sparar…" : isDirty ? "Spara och stäng" : "Klar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
