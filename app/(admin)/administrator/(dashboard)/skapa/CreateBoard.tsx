"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { emptyListing, slugify } from "@/components/admin/listing/format";
import { ListingFields } from "@/components/admin/listing/ListingFields";
import { ListingPreview } from "@/components/admin/listing/ListingPreview";
import type { Listing } from "@/lib/db/schema";
import type { Municipality } from "@/lib/build/types";
import { createListingAction } from "../innehall/actions";

export function CreateBoard({
  storageNote,
  municipalities,
}: {
  storageNote: string | null;
  municipalities: Municipality[];
}) {
  const [draft, setDraft] = useState<Listing>(emptyListing);
  // While true, the id tracks the city; typing an id by hand detaches it.
  const [idIsAuto, setIdIsAuto] = useState(true);
  // A short random tag so multiple listings in the same city get distinct
  // ids — there's no address anymore to make the slug unique on its own.
  const [idTag, setIdTag] = useState(() => Math.random().toString(36).slice(2, 6));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Listing | null>(null);

  const autoId = useMemo(
    () => slugify(draft.city, idTag),
    [draft.city, idTag]
  );
  const effectiveId = idIsAuto ? autoId : draft.id;
  const listing = useMemo<Listing>(
    () => ({ ...draft, id: effectiveId }),
    [draft, effectiveId]
  );

  const problems = useMemo(() => {
    const list: string[] = [];
    if (!listing.city.trim()) list.push("Ort måste fyllas i.");
    if (!effectiveId) list.push("Id måste fyllas i.");
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(effectiveId)) {
      list.push("Id får bara innehålla små bokstäver, siffror och enkla bindestreck.");
    }
    return list;
  }, [listing.city, effectiveId]);

  const handleCreate = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const result = await createListingAction(listing);
      if (result.ok) {
        setCreated(result.listing);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte skapa annonsen.");
    } finally {
      setIsSaving(false);
    }
  };

  const startAnother = () => {
    setDraft(emptyListing());
    setIdIsAuto(true);
    setIdTag(Math.random().toString(36).slice(2, 6));
    setCreated(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col gap-1 px-8 py-8">
        <h1 className="text-2xl font-semibold">Skapa annons</h1>
        <p className="max-w-2xl text-sm text-panel-muted">
          Fyll i uppgifterna och se förhandsvisningen nedan uppdateras direkt
          — den visar exakt hur annonsen kommer att se ut på webbplatsen och
          här i adminpanelen, innan du sparar något.
        </p>
      </header>

      <main className="flex flex-col gap-6 px-8 pb-12">
        {created ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            <span className="font-mono">{created.id}</span> har skapats.{" "}
            <Link href="/administrator/innehall" className="font-medium underline">
              Visa under Innehåll
            </Link>
            <button
              type="button"
              onClick={startAnother}
              className="ml-3 font-medium underline"
            >
              Skapa en till
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
            <div className="mb-4 flex flex-col gap-1">
              <label className="text-xs font-medium text-panel-muted">
                Id
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={effectiveId}
                  onChange={(e) => {
                    setIdIsAuto(false);
                    setDraft((prev) => ({ ...prev, id: e.target.value }));
                  }}
                  placeholder="storgatan-14-ljungby"
                  className="w-full max-w-md rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-sm outline-none focus:border-accent"
                />
                {idIsAuto ? (
                  <span className="text-xs text-panel-muted">
                    Skapas automatiskt från ort
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIdIsAuto(true)}
                    className="text-xs font-medium text-accent hover:opacity-80"
                  >
                    Återgå till automatiskt
                  </button>
                )}
              </div>
            </div>

            <ListingFields
              value={draft}
              onChange={setDraft}
              storageNote={storageNote}
              variant="create"
              onUploadError={setError}
              municipalities={municipalities}
            />

            {error && (
              <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
              <p className="text-xs text-panel-muted">
                {problems.length > 0
                  ? problems.join(" ")
                  : "Klar att skapas."}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={startAnother}
                  disabled={isSaving}
                  className="text-sm font-medium text-panel-muted transition-colors hover:text-foreground disabled:opacity-40"
                >
                  Rensa formuläret
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSaving || problems.length > 0}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? "Skapar…" : "Skapa annons"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
          <ListingPreview listing={created ?? listing} />
        </div>
      </main>
    </div>
  );
}
