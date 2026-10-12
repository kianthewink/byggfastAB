import Link from "next/link";
import {
  ApplicationIcon,
  ContentIcon,
  CreateIcon,
  UploadIcon,
  UserPlusIcon,
  UsersIcon,
} from "@/components/admin/icons";
import { verifySession } from "@/lib/auth/dal";
import { type StatIconKey, getDashboardStats } from "@/lib/admin/stats";

export const metadata = {
  title: "Översikt — Adminpanel",
};

/** Counts have to be read per request, otherwise the page shows stale ones. */
export const dynamic = "force-dynamic";

const STAT_ICONS: Record<StatIconKey, typeof UsersIcon> = {
  users: UsersIcon,
  accounts: UserPlusIcon,
  listings: ContentIcon,
  applications: ApplicationIcon,
};

const QUICK_ACTIONS = [
  { label: "Importera annonser", icon: UploadIcon, href: "/administrator/importera" },
  { label: "Skapa ny annons", icon: CreateIcon, href: "/administrator/skapa" },
  { label: "Visa allt innehåll", icon: ContentIcon, href: "/administrator/innehall" },
  {
    label: "Bjud in administratör",
    icon: UserPlusIcon,
    href: "/administrator/administratorer",
  },
];

const numberFormat = new Intl.NumberFormat("sv-SE");

export default async function OversiktPage() {
  await verifySession();

  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col gap-1 px-8 py-8">
        <h1 className="text-2xl font-semibold">Översikt</h1>
        <p className="text-sm text-panel-muted">
          Välkommen tillbaka — här är läget just nu.
        </p>
      </header>

      <main className="flex flex-col gap-6 px-8 pb-12">
        {/* Six columns: the four stat cards take one each, Snabbval takes
            the remaining two, so everything sits in a single row. */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {stats.map((stat) => {
            const Icon = STAT_ICONS[stat.key];
            const isPositive = (stat.deltaPercent ?? 0) > 0;
            return (
              <div
                key={stat.key}
                className="flex flex-col gap-3 rounded-xl border border-border bg-panel p-5 text-panel-foreground"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  {/* No badge at all when there is no honest baseline to
                      compare against — better than inventing a percentage. */}
                  {stat.deltaPercent !== null && stat.deltaPercent !== 0 && (
                    <span
                      className={`text-xs font-semibold ${
                        isPositive ? "text-emerald-600" : "text-rose-600"
                      }`}
                      title="Jämfört med förra månaden"
                    >
                      {isPositive ? "+" : ""}
                      {stat.deltaPercent} %
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {numberFormat.format(stat.value)}
                  </p>
                  <p className="text-sm text-panel-muted">{stat.label}</p>
                  <p className="mt-1 text-xs text-panel-muted">{stat.note}</p>
                </div>
              </div>
            );
          })}

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-panel p-5 text-panel-foreground lg:col-span-2">
            <h2 className="text-sm font-semibold">Snabbval</h2>
            <div className="flex flex-col gap-2">
              {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
