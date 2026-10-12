import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import { requireUser } from "@/lib/auth/user-dal";
import { formatDate, formatQueueTime } from "@/lib/format";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Mina uppgifter | BOFAST" };

export default async function UppgifterPage() {
  const user = await requireUser();

  const address = [user.street, [user.postalCode, user.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  const rows: { label: string; value: string }[] = [
    { label: "Namn", value: `${user.firstName} ${user.lastName}` },
    { label: "E-postadress", value: user.email },
    { label: "Telefonnummer", value: user.phone ?? "—" },
    { label: "Adress", value: address || "—" },
    { label: "Kundnummer", value: user.customerNumber ?? "—" },
    { label: "I kön sedan", value: formatDate(user.queueStartedAt) },
    { label: "Kötid", value: formatQueueTime(user.queueStartedAt) },
  ];

  return (
    <>
      <PageHeader
        title="Mina uppgifter"
        subtitle="Uppgifterna vi har registrerade om dig."
      />
      <Container className="py-12 md:py-16">
        <Link
          href="/mina-sidor"
          className="inline-flex items-center gap-1.5 text-sm text-brand underline-offset-2 hover:underline"
        >
          <Icon name="arrow-left" size={16} />
          Tillbaka till Mina sidor
        </Link>

        <dl className="mt-8 max-w-2xl divide-y divide-line rounded-md border border-line bg-white">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4 sm:px-6"
            >
              <dt className="text-xs tracking-wide text-muted label-caps">
                {row.label}
              </dt>
              <dd className="break-words text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-2xl rounded-md border border-line bg-surface-3 px-5 py-4 text-sm leading-relaxed text-muted">
          Behöver du ändra något? Hör av dig till oss på{" "}
          <a
            href={`tel:${site.address.phone.replace(/[\s-]/g, "")}`}
            className="text-brand underline-offset-2 hover:underline"
          >
            {site.address.phone}
          </a>{" "}
          eller{" "}
          <a
            href="mailto:info@bofast.se"
            className="text-brand underline-offset-2 hover:underline"
          >
            info@bofast.se
          </a>{" "}
          så uppdaterar vi dina uppgifter. Att redigera dem själv här är på väg.
        </p>
      </Container>
    </>
  );
}
