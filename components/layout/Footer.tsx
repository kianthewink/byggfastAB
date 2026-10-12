import Link from "next/link";
import Container from "@/components/ui/Container";
import Logo from "@/components/layout/Logo";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <Container className="grid gap-8 py-10 md:grid-cols-4">
        {/* Company */}
        <div>
          <h2 className="text-base font-bold text-brand">{site.fullName}</h2>
          <address className="mt-3 text-sm not-italic leading-relaxed text-ink">
            {site.address.street}
            <br />
            {site.address.zip} {site.address.city}
            <br />
            Tel. {site.address.phone}
          </address>
        </div>

        {/* Opening hours */}
        <div>
          <h2 className="text-sm font-semibold text-ink label-caps">
            Våra öppettider
          </h2>
          <dl className="mt-3 space-y-1 text-sm text-ink">
            {site.openingHours.map((row) => (
              <div key={row.days} className="flex justify-between gap-4">
                <dt>{row.days}</dt>
                <dd className="text-muted">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Links */}
        <div>
          <ul className="space-y-2 text-sm">
            {site.footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-brand underline-offset-2 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logo */}
        <div className="flex items-start md:justify-end">
          <Logo />
        </div>
      </Container>

      <div className="border-t border-line/70">
        <Container className="py-4 text-xs text-muted">
          © {new Date().getFullYear()} {site.fullName}. Alla rättigheter förbehållna.
        </Container>
      </div>
    </footer>
  );
}
