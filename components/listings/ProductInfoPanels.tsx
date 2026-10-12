"use client";

import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import {
  INSTALLATION_SECTIONS,
  TECH_SPEC_SECTIONS,
  type ListingDocument,
  type SpecKey,
  type SpecSection,
} from "@/lib/listings/spec-sections";

type PanelId = "documents" | "tech" | "install";

const ROWS: { id: PanelId; label: string; icon: IconName }[] = [
  { id: "documents", label: "Dokument", icon: "file-pdf" },
  { id: "tech", label: "Teknisk specifikation", icon: "ruler" },
  { id: "install", label: "Installation & montering", icon: "factory" },
];

/**
 * The three rows under a product's details — Dokument, Teknisk
 * specifikation, Installation & montering — each opening a side panel from
 * the right. The two spec panels are accordions, one section per database
 * column (see lib/listings/spec-sections.ts).
 */
export default function ProductInfoPanels({
  documents,
  specs,
}: {
  documents: ListingDocument[];
  specs: Record<SpecKey, string[]>;
}) {
  const [open, setOpen] = useState<PanelId | null>(null);
  // A document picked in the Dokument panel is shown inline in the panel.
  const [activeDoc, setActiveDoc] = useState<ListingDocument | null>(null);

  const close = () => {
    setOpen(null);
    setActiveDoc(null);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const title = ROWS.find((row) => row.id === open)?.label ?? "";

  return (
    <>
      <ul className="space-y-3">
        {ROWS.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => setOpen(row.id)}
              aria-haspopup="dialog"
              className="group flex w-full items-center gap-4 rounded-md border border-line bg-white px-5 py-5 text-left text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-3 text-brand">
                <Icon name={row.icon} size={24} />
              </span>
              <span className="flex-1 text-lg font-medium group-hover:text-brand">
                {row.label}
              </span>
              <Icon
                name="chevron-right"
                size={24}
                className="shrink-0 text-brand transition-transform group-hover:translate-x-1"
              />
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Stäng"
            onClick={close}
            className="panel-backdrop-in absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`panel-slide-in relative flex h-full w-full flex-col bg-white shadow-2xl transition-[max-width] ${
              activeDoc ? "max-w-3xl" : "max-w-md"
            }`}
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8">
              <div className="min-w-0">
                {activeDoc && (
                  <button
                    type="button"
                    onClick={() => setActiveDoc(null)}
                    className="mb-2 inline-flex items-center gap-1 text-sm text-brand underline-offset-2 hover:underline"
                  >
                    <Icon name="chevron-left" size={16} />
                    Alla dokument
                  </button>
                )}
                <h2 className="truncate text-2xl text-brand">
                  {activeDoc?.name ?? title}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Stäng panelen"
                autoFocus
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink transition-colors hover:bg-surface-2"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4 sm:px-8">
              {open === "documents" &&
                (activeDoc ? (
                  <DocumentViewer doc={activeDoc} />
                ) : (
                  <DocumentList documents={documents} onOpen={setActiveDoc} />
                ))}
              {open === "tech" && (
                <SpecAccordion
                  intro="Nyckelfärdigt innebär att huset färdigställs interiört, exteriört samt alla inkopplingar görs. Huset är inflyttningsklart."
                  sections={TECH_SPEC_SECTIONS}
                  specs={specs}
                />
              )}
              {open === "install" && (
                <SpecAccordion sections={INSTALLATION_SECTIONS} specs={specs} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DocumentList({
  documents,
  onOpen,
}: {
  documents: ListingDocument[];
  onOpen: (doc: ListingDocument) => void;
}) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted">
        Inga dokument har lagts upp för det här huset ännu.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line border-t border-line">
      {documents.map((doc) => (
        <li key={doc.url}>
          <button
            type="button"
            onClick={() => onOpen(doc)}
            className="flex w-full items-center gap-3 py-4 text-left text-ink transition-colors hover:text-brand"
          >
            <Icon name="file-pdf" size={20} className="shrink-0 text-brand" />
            <span className="flex-1">{doc.name}</span>
            <Icon name="chevron-right" size={18} className="shrink-0" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function DocumentViewer({ doc }: { doc: ListingDocument }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <iframe
        src={doc.url}
        title={doc.name}
        className="min-h-[60vh] w-full flex-1 rounded-md border border-line"
      />
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="inline-flex items-center gap-2 self-start text-sm text-brand underline-offset-2 hover:underline"
      >
        <Icon name="download" size={16} />
        Ladda ner PDF
      </a>
    </div>
  );
}

function SpecAccordion({
  intro,
  sections,
  specs,
}: {
  intro?: string;
  sections: readonly SpecSection[];
  specs: Record<SpecKey, string[]>;
}) {
  const filled = sections.filter(({ key }) => specs[key].length > 0);

  return (
    <div>
      {intro && (
        <p className="mb-6 text-sm leading-relaxed text-muted">{intro}</p>
      )}
      {filled.length === 0 ? (
        <p className="text-sm text-muted">Information kommer snart.</p>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {filled.map(({ key, label }, index) => (
            <details key={key} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-5 text-base text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
                {label}
                <Icon
                  name="chevron-down"
                  size={18}
                  className="shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <SpecItems items={specs[key]} />
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/** One entry reads as prose; several as the numbered build-up list. */
function SpecItems({ items }: { items: string[] }) {
  if (items.length === 1) {
    return (
      <p className="pb-5 text-sm leading-relaxed text-ink">{items[0]}</p>
    );
  }
  return (
    <ol className="list-decimal space-y-1 pb-5 pl-9 text-sm leading-relaxed text-ink">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}
