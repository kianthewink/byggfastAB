"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon } from "@/components/admin/icons";
import type { Listing } from "@/lib/db/schema";
import type { Municipality } from "@/lib/build/types";
import { deleteListingAction, resetToSeedAction, updateListingAction } from "./actions";
import { ListingCard } from "./ListingCard";

export function ContentBoard({
  initialListings,
  storageNote,
  municipalities,
}: {
  initialListings: Listing[];
  storageNote: string | null;
  municipalities: Municipality[];
}) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const attefallshus = listings.filter(
    (l) => l.listingType === "attefallshus"
  );
  const attefallshusKallare = listings.filter(
    (l) => l.listingType === "attefallshus_med_kallare"
  );

  const handleSave = async (listing: Listing) => {
    const saved = await updateListingAction(listing);
    setListings((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));
  };

  const handleDelete = async (id: string) => {
    await deleteListingAction(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const seeded = await resetToSeedAction();
      setListings(seeded);
      setConfirmingReset(false);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col gap-3 px-8 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Innehåll</h1>
          <p className="max-w-2xl text-sm text-panel-muted">
            {listings.length} annonser. Klicka på en för att redigera den —
            hyra, rum, bekvämligheter, bilder, beskrivning och visningstider
            sparas direkt. Fält som används mer sällan, som våning och
            koordinater, ligger under &rdquo;Övriga uppgifter&rdquo;. Använd
            Importera för att hämta in fler från ett kalkylark.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {confirmingReset ? (
            <>
              <span className="text-sm text-panel-muted">
                Rensa databasen och läsa in exempeldata igen? Det påverkar
                alla.
              </span>
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isResetting ? "Återställer…" : "Återställ"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                disabled={isResetting}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-panel"
              >
                Avbryt
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-panel-muted transition-colors hover:bg-panel hover:text-foreground"
            >
              Återställ till exempeldata
            </button>
          )}
          <Link
            href="/administrator/importera"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            <PlusIcon className="h-4 w-4" />
            Importera annonser
          </Link>
        </div>
      </header>

      <main className="flex flex-col gap-8 px-8 pb-12">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-panel-muted">
            Attefallshus &middot; {attefallshus.length}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {attefallshus.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSave={handleSave}
                onDelete={handleDelete}
                storageNote={storageNote}
                municipalities={municipalities}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-panel-muted">
            Attefallshus med källare &middot; {attefallshusKallare.length}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {attefallshusKallare.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSave={handleSave}
                onDelete={handleDelete}
                storageNote={storageNote}
                municipalities={municipalities}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
