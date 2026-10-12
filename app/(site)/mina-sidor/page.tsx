import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import LoginForm from "@/components/auth/LoginForm";
import AccountDashboard from "@/components/account/AccountDashboard";
import { getCurrentUser } from "@/lib/auth/user-dal";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { getSavedCount } from "@/lib/listings/saved";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Mina sidor | BOFAST" };

/** Vad man kan göra när man är inloggad – visas bredvid inloggningen. */
const benefits = [
  "Spara attefallshus du är intresserad av",
  "Se din kötid och dina uppgifter",
  "Gör en felanmälan och följ ärendet",
  "Uppdatera dina kontaktuppgifter",
  "Anmäl intresse för lediga attefallshus",
  "Se dina hyresavier och din betalningshistorik",
];

/** Sentinel meaning "nothing usable in ?next=" — never rendered. */
const NO_REDIRECT = "";

export default async function MinaSidorPage({
  searchParams,
}: {
  // A repeated key (?next=a&next=b) arrives as an array, so this is not
  // simply `string | undefined`.
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    return (
      <>
        <PageHeader
          title="Mina sidor"
          subtitle={`Inloggad som ${user.firstName} ${user.lastName}.`}
        />
        <Container className="py-12 md:py-16">
          <AccountDashboard user={user} savedCount={await getSavedCount()} />
        </Container>
      </>
    );
  }

  const { next } = await searchParams;
  // The Server Action re-checks this; there's no reason to render a target
  // it would only throw away.
  const redirectTo = safeRedirectPath(next, NO_REDIRECT) || undefined;

  return (
    <>
      <PageHeader
        title="Mina sidor"
        subtitle="Logga in eller registrera dig som sökande eller hyresgäst."
      />
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <LoginForm redirectTo={redirectTo} />
          </div>

          <aside className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="text-base text-brand">
                Det här kan du göra när du är inloggad
              </h2>
              <ul className="mt-4 space-y-2.5">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-ink"
                  >
                    <Icon
                      name="check"
                      size={16}
                      className="mt-0.5 shrink-0 text-brand"
                    />
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-md border border-line bg-surface-3 p-6">
              <h2 className="text-base text-brand">Behöver du hjälp?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                Kommer du inte in på ditt konto? Kontakta oss så hjälper vi dig
                att komma igång.
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
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Vid akuta fel utanför våra öppettider, se{" "}
                <Link
                  href="/bra-att-veta"
                  className="text-brand underline-offset-2 hover:underline"
                >
                  Bra att veta
                </Link>
                .
              </p>
            </section>
          </aside>
        </div>
      </Container>
    </>
  );
}
