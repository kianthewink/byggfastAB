import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth/user-dal";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Registrera dig som bostadssökande | BOFAST",
  description:
    "Skapa ett kostnadsfritt konto hos BOFAST och ställ dig i bostadskön. Din kötid börjar räknas direkt.",
};

const steps = [
  {
    title: "Skapa ditt konto",
    body: "Fyll i namn, e-post och telefonnummer. Det tar någon minut.",
  },
  {
    title: "Din kötid börjar räknas",
    body: "Kötiden startar samma dag som du registrerar dig och avgör din plats i kön.",
  },
  {
    title: "Spara och anmäl intresse",
    body: "Spara lediga attefallshus så hittar du tillbaka till dem på Mina sidor.",
  },
];

export default async function RegistreraPage() {
  // Already signed in? Then there is nothing to register.
  if (await getCurrentUser()) {
    redirect("/mina-sidor");
  }

  return (
    <>
      <PageHeader
        title="Registrera dig som bostadssökande"
        subtitle="Ställ dig i bostadskön hos BOFAST – kostnadsfritt och utan bindningstid."
      />
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <RegisterForm />
          </div>

          <aside className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="text-base text-brand">Så funkar det</h2>
              <ol className="mt-4 space-y-5">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-3.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs text-brand">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm text-ink">
                        {step.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">
                        {step.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-md border border-line bg-surface-3 p-6">
              <h2 className="text-base text-brand">Om dina uppgifter</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                Vi använder dina uppgifter för att administrera din plats i
                bostadskön och för att kunna kontakta dig om lediga bostäder.
                Du kan när som helst höra av dig för att få kontot borttaget.
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
            </section>
          </aside>
        </div>
      </Container>
    </>
  );
}
