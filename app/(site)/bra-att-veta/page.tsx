import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import InfoCardItem from "@/components/info/InfoCardItem";
import FaqSection from "@/components/info/FaqSection";
import Button from "@/components/ui/Button";
import { practicalInfo } from "@/data/practicalInfo";
import { faqCategories } from "@/data/faq";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Bra att veta | BOFAST" };

export default function BraAttVetaPage() {
  return (
    <>
      <PageHeader
        title="Bra att veta"
        subtitle="Vanliga frågor och praktisk information för dig som hyresgäst."
      />

      <Container className="py-12 md:py-16">
        <p className="max-w-3xl text-sm leading-relaxed text-ink">
          Här har vi samlat det som brukar dyka upp under hyrestiden – från
          hyresinbetalning och felanmälan till vad som gäller när du ska flytta.
          Hittar du inte svaret är du alltid välkommen att höra av dig till
          kontoret, vi svarar gärna på dina frågor.
        </p>

        {/* Praktisk information */}
        <section className="mt-10" aria-labelledby="praktisk-information">
          <h2 id="praktisk-information" className="text-xl text-brand">
            Praktisk information
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practicalInfo.map((card) => (
              <InfoCardItem key={card.id} card={card} />
            ))}
          </div>
        </section>
      </Container>

      {/* Vanliga frågor */}
      <section className="bg-surface-3 py-12 md:py-16" aria-labelledby="faq">
        <Container>
          <h2 id="faq" className="text-xl text-brand">
            Vanliga frågor
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink">
            Klicka på en fråga för att läsa svaret.
          </p>
          <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-2">
            {faqCategories.map((category) => (
              <FaqSection key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      {/* Kontakt */}
      <Container className="py-12 md:py-16">
        <div className="rounded-md border border-line bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl text-brand">Fick du inte svar?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                Ring eller mejla oss så hjälper vi dig. Under kontorstid når du
                oss på {site.address.phone}, och vid akuta fel utanför
                öppettiderna kopplas du vidare till vår fastighetsjour.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink">
                <li className="flex items-center gap-2.5">
                  <Icon name="phone" size={16} className="shrink-0 text-brand" />
                  <a
                    href={`tel:${site.address.phone.replace(/[\s-]/g, "")}`}
                    className="hover:text-brand"
                  >
                    {site.address.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon name="mail" size={16} className="shrink-0 text-brand" />
                  <a href="mailto:info@bofast.se" className="hover:text-brand">
                    info@bofast.se
                  </a>
                </li>
              </ul>
            </div>

            <div className="shrink-0">
              <Button href="/felanmalan">Gör en felanmälan...</Button>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
            {site.openingHours.map((row) => (
              <div key={row.days}>
                <dt className="text-xs text-muted label-caps">{row.days}</dt>
                <dd className="mt-1 text-sm text-ink">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </>
  );
}
