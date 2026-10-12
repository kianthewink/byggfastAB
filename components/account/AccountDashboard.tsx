import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import type { CurrentUser } from "@/lib/auth/user-dal";
import { formatDate, formatQueueTime } from "@/lib/format";

interface AccountDashboardProps {
  user: CurrentUser;
  savedCount: number;
}

const shortcuts: { href: string; icon: IconName; title: string; body: string }[] =
  [
    {
      href: "/mina-sidor/sparade",
      icon: "heart",
      title: "Sparade objekt",
      body: "Attefallshus du har sparat.",
    },
    {
      href: "/mina-sidor/uppgifter",
      icon: "user",
      title: "Mina uppgifter",
      body: "Se namn, e-post, telefon och adress.",
    },
    {
      href: "/attefallshus",
      icon: "search",
      title: "Attefallshus",
      body: "Bläddra bland allt som är ute just nu.",
    },
    {
      href: "/felanmalan",
      icon: "wrench",
      title: "Felanmälan",
      body: "Anmäl ett fel i din bostad eller i fastigheten.",
    },
  ];

/** Landing view on Mina sidor once you're signed in. */
export default function AccountDashboard({
  user,
  savedCount,
}: AccountDashboardProps) {
  const stats = [
    { label: "Kötid", value: formatQueueTime(user.queueStartedAt) },
    {
      label: "Sparade objekt",
      value: String(savedCount),
    },
    {
      label: user.customerNumber ? "Kundnummer" : "Konto",
      value: user.customerNumber ?? "Bostadssökande",
    },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl text-brand">Hej {user.firstName}!</h2>
        <p className="mt-1 text-sm text-muted">
          Du står i bostadskön sedan {formatDate(user.queueStartedAt)}.
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-line bg-surface-3 p-5"
            >
              <dt className="text-xs tracking-wide text-muted label-caps">
                {stat.label}
              </dt>
              <dd className="mt-1.5 text-lg text-brand">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2 className="text-base text-brand">Genvägar</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.href}>
              <Link
                href={shortcut.href}
                className="flex h-full items-start gap-3 rounded-md border border-line bg-white p-5 transition-colors hover:border-brand-light/60 hover:bg-surface-3"
              >
                <Icon
                  name={shortcut.icon}
                  size={18}
                  className="mt-0.5 shrink-0 text-brand"
                />
                <span>
                  <span className="block text-sm text-ink">
                    {shortcut.title}
                    {shortcut.href === "/mina-sidor/sparade" &&
                      savedCount > 0 && (
                        <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-ink">
                          {savedCount}
                        </span>
                      )}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {shortcut.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="rounded-md border border-line bg-surface-3 px-5 py-4 text-xs leading-relaxed text-muted">
        Hyresavier, betalningshistorik och digital uppsägning är på väg. Fram
        till dess hjälper vårt kontor dig med de ärendena.
      </p>
    </div>
  );
}
