import Link from "next/link";
import { ChevronDownIcon } from "@/components/admin/icons";
import { verifySession } from "@/lib/auth/dal";
import {
  listApplicationsForAdmin,
  type ApplicationListItem,
} from "@/lib/admin/applications";
import { formatKr } from "@/lib/build/pricing";
import { listingHref } from "@/lib/listings/saved";

export const metadata = {
  title: "Ansökningar — Adminpanel",
};

/** Read per request, otherwise a just-submitted application wouldn't show. */
export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Stockholm",
});

const STATUS_LABEL: Record<string, string> = {
  submitted: "Inskickad",
  in_review: "Under granskning",
  accepted: "Godkänd",
  rejected: "Nekad",
};

export default async function AnsokningarPage() {
  await verifySession();
  const applications = await listApplicationsForAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col gap-1 px-8 py-8">
        <h1 className="text-2xl font-semibold">Ansökningar</h1>
        <p className="max-w-2xl text-sm text-panel-muted">
          {applications.length}{" "}
          {applications.length === 1 ? "intresseanmälan" : "intresseanmälningar"}
          {" "}skickade via &ldquo;Anmäl intresse&rdquo; på attefallshusens
          sidor. Klicka på en för kontaktuppgifter och allt sökanden valde i
          Bygg online.
        </p>
      </header>

      <main className="flex flex-col gap-3 px-8 pb-12">
        {applications.length === 0 ? (
          <div className="rounded-xl border border-border bg-panel p-8 text-center text-sm text-panel-muted">
            Inga intresseanmälningar har skickats in ännu.
          </div>
        ) : (
          applications.map((app) => <ApplicationCard key={app.id} app={app} />)
        )}
      </main>
    </div>
  );
}

function ApplicationCard({ app }: { app: ApplicationListItem }) {
  const quote = app.configuration;
  const typeLabel =
    app.listingType === "attefallshus" ? "Attefallshus" : "Attefallshus med källare";
  const wasUpdated = app.updatedAt.getTime() - app.createdAt.getTime() > 60_000;

  return (
    <details className="group rounded-xl border border-border bg-panel text-panel-foreground">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{app.userName}</p>
          <p className="truncate text-xs text-panel-muted">
            {typeLabel} i {app.listingCity}
            {quote?.package && ` · ${quote.package.name}`}
            {quote?.municipality && ` · ${quote.municipality.name}`}
          </p>
        </div>
        {quote && (
          <span className="text-sm font-semibold">{formatKr(quote.total)}</span>
        )}
        <span className="whitespace-nowrap text-xs text-panel-muted">
          {dateFormat.format(app.updatedAt)}
        </span>
        <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-medium text-panel-muted">
          {STATUS_LABEL[app.status] ?? app.status}
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-panel-muted transition-transform group-open:rotate-180" />
      </summary>

      <div className="grid gap-6 border-t border-border p-4 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-panel-muted">
              Kontakt
            </h3>
            <dl className="space-y-1.5">
              <Row label="Namn" value={app.userName} />
              <Row
                label="Telefon"
                value={
                  app.userPhone ? (
                    <a href={`tel:${app.userPhone.replace(/[^\d+]/g, "")}`} className="font-medium text-accent hover:underline">
                      {app.userPhone}
                    </a>
                  ) : (
                    <span className="text-panel-muted">Saknas (äldre konto)</span>
                  )
                }
              />
              <Row
                label="E-post"
                value={
                  <a href={`mailto:${app.userEmail}`} className="text-accent hover:underline">
                    {app.userEmail}
                  </a>
                }
              />
              {app.customerNumber && <Row label="Kundnummer" value={app.customerNumber} />}
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-panel-muted">
              Objekt
            </h3>
            <dl className="space-y-1.5">
              <Row
                label="Annons"
                value={
                  <Link
                    href={listingHref(app.listingType, app.listingId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {typeLabel} i {app.listingCity}
                  </Link>
                }
              />
              <Row label="Skickad" value={dateFormat.format(app.createdAt)} />
              {wasUpdated && (
                <Row label="Uppdaterad" value={dateFormat.format(app.updatedAt)} />
              )}
            </dl>
          </section>

          {app.message && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-panel-muted">
                Meddelande
              </h3>
              <p className="whitespace-pre-line">{app.message}</p>
            </section>
          )}
        </div>

        <section className="text-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-panel-muted">
            Bygg online-val
          </h3>
          {quote ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full">
                <tbody className="divide-y divide-border">
                  <QuoteRow label="Kommun" value={quote.municipality?.name ?? "Ej vald (grundpris)"} />
                  {quote.package && (
                    <QuoteRow
                      label="Köpalternativ"
                      value={quote.package.name}
                      price={quote.package.price}
                    />
                  )}
                  {quote.lines.map((line) => (
                    <QuoteRow
                      key={`${line.group}-${line.category}-${line.option}`}
                      label={`${line.group} · ${line.category}`}
                      value={line.option}
                      price={line.price}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-card/50 font-semibold">
                    <td className="px-3 py-2.5" colSpan={2}>
                      Totalt (pris när anmälan skickades)
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      {formatKr(quote.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-panel-muted">
              Skickad innan Bygg online fanns — inga val sparade.
            </p>
          )}
        </section>
      </div>
    </details>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-panel-muted">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </div>
  );
}

function QuoteRow({
  label,
  value,
  price,
}: {
  label: string;
  value: string;
  price?: number;
}) {
  return (
    <tr>
      <td className="px-3 py-2 text-panel-muted">{label}</td>
      <td className="px-3 py-2">{value}</td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        {price == null ? "" : price === 0 ? "Ingår" : formatKr(price)}
      </td>
    </tr>
  );
}
