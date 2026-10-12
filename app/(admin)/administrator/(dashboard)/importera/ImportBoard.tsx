"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { FileSpreadsheetIcon, UploadIcon } from "@/components/admin/icons";
import { listingTypeLabel } from "@/components/admin/listing/format";
import { ListingPreview } from "@/components/admin/listing/ListingPreview";
import type { Listing } from "@/lib/db/schema";
import {
  type ImportMode,
  type ImportSummary,
  importListingsAction,
} from "../innehall/actions";
import { parseWorkbook, type ParsedRow } from "./parse";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

const currency = new Intl.NumberFormat("sv-SE");

export function ImportBoard({
  initialListings,
}: {
  initialListings: Listing[];
}) {
  const [knownIds, setKnownIds] = useState<Set<string>>(
    () => new Set(initialListings.map((l) => l.id))
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [existingIds, setExistingIds] = useState<Set<string>>(new Set());
  const [previewRow, setPreviewRow] = useState<number | null>(null);
  // Rows the user has unticked — parsed fine, but excluded from this import.
  const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<ImportMode>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const previewListing = useMemo(() => {
    if (previewRow === null) return null;
    const row = (rows ?? []).find(
      (r) => r.rowNumber === previewRow && r.status === "valid"
    );
    return row && row.status === "valid" ? row.listing : null;
  }, [previewRow, rows]);

  const validRows = useMemo(
    () => (rows ?? []).filter((r) => r.status === "valid"),
    [rows]
  );
  const errorRows = useMemo(
    () => (rows ?? []).filter((r) => r.status === "error"),
    [rows]
  );
  /** Whether a valid row matches the current import mode ("new" excludes
   *  updates, "update" excludes new rows, "all" excludes nothing). */
  const rowMatchesMode = useCallback(
    (row: ParsedRow) => {
      if (row.status !== "valid" || mode === "all") return true;
      const isUpdate = existingIds.has(row.listing.id);
      return mode === "new" ? !isUpdate : isUpdate;
    },
    [mode, existingIds]
  );
  /** Valid rows eligible under the current mode. */
  const eligibleRows = useMemo(
    () => validRows.filter(rowMatchesMode),
    [validRows, rowMatchesMode]
  );
  /** Eligible rows still ticked for import. */
  const selectedRows = useMemo(
    () => eligibleRows.filter((r) => !excludedRows.has(r.rowNumber)),
    [eligibleRows, excludedRows]
  );
  const selectedListings = useMemo(
    () =>
      selectedRows
        .map((r) => (r.status === "valid" ? r.listing : null))
        .filter((l): l is Listing => l !== null),
    [selectedRows]
  );
  const newCount = useMemo(
    () =>
      selectedRows.filter(
        (r) => r.status === "valid" && !existingIds.has(r.listing.id)
      ).length,
    [selectedRows, existingIds]
  );
  const updateCount = selectedRows.length - newCount;
  const warningCount = useMemo(
    () => selectedRows.filter((r) => r.status === "valid" && r.warnings.length > 0).length,
    [selectedRows]
  );

  const allSelected =
    eligibleRows.length > 0 && selectedRows.length === eligibleRows.length;
  const noneSelected = selectedRows.length === 0;

  const toggleRow = (rowNumber: number) => {
    setExcludedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  };

  const toggleAll = () => {
    setExcludedRows(
      allSelected ? new Set(eligibleRows.map((r) => r.rowNumber)) : new Set()
    );
  };

  const handleFile = async (file: File) => {
    setFileError(null);
    setImportError(null);
    setResult(null);
    setPreviewRow(null);
    setExcludedRows(new Set());
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFileError(
        `Filtypen "${ext || "okänd"}" stöds inte. Använd .xlsx, .xls eller .csv.`
      );
      setFileName(null);
      setRows(null);
      return;
    }
    setFileName(file.name);
    setIsParsing(true);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseWorkbook(buffer);
      setExistingIds(new Set(knownIds));
      setRows(parsed);
    } catch {
      setFileError("Kunde inte läsa filen — är det ett giltigt kalkylark?");
      setRows(null);
    } finally {
      setIsParsing(false);
    }
  };

  const reset = () => {
    setFileName(null);
    setRows(null);
    setFileError(null);
    setImportError(null);
    setResult(null);
    setPreviewRow(null);
    setExcludedRows(new Set());
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleImport = async () => {
    const listingsToImport = selectedListings;

    setImportError(null);
    setIsImporting(true);
    try {
      const summary = await importListingsAction(listingsToImport, mode);
      setResult(summary);
      setKnownIds((prev) => {
        const next = new Set(prev);
        listingsToImport.forEach((l) => next.add(l.id));
        return next;
      });
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Importen misslyckades."
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col gap-1 px-8 py-8">
        <h1 className="text-2xl font-semibold">Importera annonser</h1>
        <p className="max-w-2xl text-sm text-panel-muted">
          Ladda upp ett kalkylark i BOFAST:s importformat (en rad per annons,
          med kolumner som <code>id</code>, <code>listingType</code>,{" "}
          <code>city</code>, <code>images</code>, <code>amenities</code>,{" "}
          <code>viewingDates</code> och <code>viewingTimes</code> — varje
          kolumn med flera värden separerade med <code>;</code>, t.ex.{" "}
          <code>Balkong;Diskmaskin</code>). <code>viewingDates</code> och{" "}
          <code>viewingTimes</code> paras ihop efter position. Rader matchas
          mot befintliga annonser via <code>id</code> — matchande rader
          uppdateras, nya id:n läggs till.
        </p>
      </header>

      <main className="flex flex-col gap-6 px-8 pb-12">
        {!rows && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-16 text-center transition-colors ${
              isDragging
                ? "border-accent bg-panel"
                : "border-border bg-panel/50 hover:border-accent"
            }`}
          >
            <UploadIcon className="h-8 w-8 text-accent" />
            <div>
              <p className="text-sm font-medium">
                {isParsing
                  ? "Läser filen…"
                  : "Dra och släpp ett kalkylark här, eller klicka för att välja"}
              </p>
              <p className="mt-1 text-xs text-panel-muted">
                .xlsx, .xls eller .csv
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(",")}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}

        {fileError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
            {fileError}
          </div>
        )}

        {rows && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-panel px-4 py-3 text-panel-foreground">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheetIcon className="h-5 w-5 shrink-0 text-panel-muted" />
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-panel-muted">
                    {rows.length} rader &middot; {selectedRows.length} av{" "}
                    {eligibleRows.length} valda &middot; {newCount} nya &middot;{" "}
                    {updateCount} uppdateringar &middot; {errorRows.length} fel
                    {warningCount > 0 && (
                      <>
                        {" "}
                        &middot; {warningCount} varning
                        {warningCount === 1 ? "" : "ar"}
                      </>
                    )}
                    {mode !== "all" && validRows.length > eligibleRows.length && (
                      <>
                        {" "}
                        &middot; {validRows.length - eligibleRows.length} hoppas
                        över (läge)
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  disabled={isImporting}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-card disabled:opacity-50"
                >
                  Välj en annan fil
                </button>
                <button
                  type="button"
                  disabled={noneSelected || result !== null || isImporting}
                  onClick={handleImport}
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isImporting
                    ? "Importerar…"
                    : `Importera ${selectedRows.length} annons${selectedRows.length === 1 ? "" : "er"}`}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-panel px-4 py-3 text-panel-foreground">
              <span className="text-xs font-medium text-panel-muted">
                Importläge
              </span>
              <div className="inline-flex rounded-lg border border-border p-0.5">
                {(
                  [
                    { value: "all", label: "Lägg till och uppdatera" },
                    { value: "new", label: "Lägg bara till nya" },
                    { value: "update", label: "Uppdatera bara befintliga" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    disabled={isImporting || result !== null}
                    aria-pressed={mode === option.value}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      mode === option.value
                        ? "bg-accent text-accent-foreground"
                        : "text-panel-muted hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-panel-muted">
                {mode === "new" &&
                  "Bara rader med ett id som inte redan finns importeras — befintliga annonser lämnas orörda."}
                {mode === "update" &&
                  "Bara rader som matchar ett befintligt annons-id importeras — nya id:n hoppas över."}
                {mode === "all" &&
                  "Nya rader läggs till och rader som matchar ett befintligt id uppdateras."}
              </p>
            </div>

            {importError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
                {importError}
              </div>
            )}

            {result && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                Importen lyckades — {result.added} nya, {result.updated}{" "}
                uppdaterade
                {result.skipped > 0 && <>, {result.skipped} överhoppade</>}.{" "}
                <Link href="/administrator/innehall" className="font-medium underline">
                  Visa under Innehåll
                </Link>
              </div>
            )}

            {previewListing && (
              <div className="rounded-xl border border-border bg-panel p-5 text-panel-foreground">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-panel-muted">
                    Förhandsvisar rad {previewRow} &mdash;{" "}
                    <span className="font-mono">{previewListing.id}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewRow(null)}
                    className="text-xs font-medium text-panel-muted hover:text-foreground"
                  >
                    Stäng förhandsvisning
                  </button>
                </div>
                <ListingPreview listing={previewListing} />
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[780px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-panel text-left text-panel-foreground">
                    <th className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = !allSelected && !noneSelected;
                        }}
                        onChange={toggleAll}
                        disabled={eligibleRows.length === 0}
                        aria-label={
                          allSelected
                            ? "Avmarkera alla rader"
                            : "Markera alla rader"
                        }
                        className="h-4 w-4 cursor-pointer accent-[#22548F]"
                      />
                    </th>
                    <th className="px-3 py-2 font-semibold">Rad</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Id</th>
                    <th className="px-3 py-2 font-semibold">Typ</th>
                    <th className="px-3 py-2 font-semibold">Ort</th>
                    <th className="px-3 py-2 font-semibold">Hyra</th>
                    <th className="px-3 py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    if (row.status === "error") {
                      return (
                        <tr key={row.rowNumber} className="border-b border-border">
                          <td className="px-3 py-2" />
                          <td className="px-3 py-2 text-panel-muted">
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-600">
                              Fel
                            </span>
                          </td>
                          <td className="px-3 py-2 text-panel-muted" colSpan={5}>
                            {row.errors.join("; ")}
                          </td>
                        </tr>
                      );
                    }

                    const isUpdate = existingIds.has(row.listing.id);
                    const isExcluded = excludedRows.has(row.rowNumber);
                    const isModeMatch = rowMatchesMode(row);
                    return (
                      <tr
                        key={row.rowNumber}
                        className={`border-b border-border ${
                          isExcluded || !isModeMatch ? "opacity-40" : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!isExcluded && isModeMatch}
                            onChange={() => toggleRow(row.rowNumber)}
                            disabled={!isModeMatch}
                            aria-label={
                              !isModeMatch
                                ? `${row.listing.id} hoppas över av importläget`
                                : `${isExcluded ? "Ta med" : "Uteslut"} ${row.listing.id}`
                            }
                            className="h-4 w-4 cursor-pointer accent-[#22548F] disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-2 text-panel-muted">
                          {row.rowNumber}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                isUpdate
                                  ? "bg-amber-500/15 text-amber-600"
                                  : "bg-emerald-500/15 text-emerald-700"
                              }`}
                            >
                              {isUpdate ? "Uppdatering" : "Ny"}
                            </span>
                            {!isModeMatch && (
                              <span className="rounded-full bg-panel-muted/20 px-1.5 py-0.5 text-xs font-medium text-panel-muted">
                                Överhoppad
                              </span>
                            )}
                            {row.warnings.length > 0 && (
                              <span
                                title={row.warnings.join("; ")}
                                className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-600"
                              >
                                &#9888;
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-panel-muted">
                          {row.listing.id}
                        </td>
                        <td className="px-3 py-2">
                          {listingTypeLabel(row.listing.listingType)}
                        </td>
                        <td className="px-3 py-2">
                          <div>{row.listing.city}</div>
                          {row.warnings.length > 0 && (
                            <div className="mt-0.5 text-xs text-amber-600">
                              {row.warnings.join(" ")}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {currency.format(row.listing.rent)} kr
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewRow((current) =>
                                current === row.rowNumber ? null : row.rowNumber
                              )
                            }
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                              previewRow === row.rowNumber
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border text-panel-muted hover:text-foreground"
                            }`}
                          >
                            Förhandsvisa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
