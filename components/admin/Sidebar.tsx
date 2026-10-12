"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/actions";
import {
  ApplicationIcon,
  ContentIcon,
  CreateIcon,
  DashboardIcon,
  LogoMarkIcon,
  LogOutIcon,
  SettingsIcon,
  UploadIcon,
  UsersIcon,
} from "./icons";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Every entry here goes somewhere. The sidebar used to carry half a dozen
 * permanently disabled "coming soon" items (Orders, Analytics, Logs…) that
 * were never going to be built for a property CMS; they made the real pages
 * harder to find, so they are gone.
 */
const NAV_ITEMS: {
  id: string;
  label: string;
  icon: typeof DashboardIcon;
  href: string;
}[] = [
  { id: "oversikt", label: "Översikt", icon: DashboardIcon, href: "/administrator" },
  {
    id: "innehall",
    label: "Innehåll",
    icon: ContentIcon,
    href: "/administrator/innehall",
  },
  {
    id: "skapa",
    label: "Skapa annons",
    icon: CreateIcon,
    href: "/administrator/skapa",
  },
  {
    id: "importera",
    label: "Importera",
    icon: UploadIcon,
    href: "/administrator/importera",
  },
  {
    id: "bygg-online",
    label: "Bygg online",
    icon: SettingsIcon,
    href: "/administrator/bygg-online",
  },
  {
    id: "ansokningar",
    label: "Ansökningar",
    icon: ApplicationIcon,
    href: "/administrator/ansokningar",
  },
  {
    id: "administratorer",
    label: "Administratörer",
    icon: UsersIcon,
    href: "/administrator/administratorer",
  },
];

function initialsFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  const segments = localPart.split(/[.\-_]/).filter(Boolean);
  const initials =
    segments.length >= 2
      ? segments[0][0] + segments[1][0]
      : localPart.slice(0, 2);
  return initials.toUpperCase();
}

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <LogoMarkIcon className="h-8 w-8 shrink-0" />
        <div className="leading-tight">
          <p className="text-sm font-semibold">Adminpanel</p>
          <p className="text-xs text-sidebar-muted">BOFAST</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={id}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        <ThemeToggle />
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-active text-xs font-semibold">
            {initialsFromEmail(email)}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{email}</p>
            <p className="truncate text-xs text-sidebar-muted">Administratör</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground"
          >
            <LogOutIcon className="h-5 w-5 shrink-0" />
            Logga ut
          </button>
        </form>
      </div>
    </aside>
  );
}
