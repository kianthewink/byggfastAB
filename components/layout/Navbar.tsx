"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/data/navigation";
import type { NavItem } from "@/lib/types";
import Container from "@/components/ui/Container";
import Logo from "@/components/layout/Logo";
import Icon from "@/components/ui/Icon";

/** The element (components/build/BuildOnline.tsx) where the bar stops following. */
const STICKY_RELEASE_ID = "bygg-online";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** A single top-level nav entry with an optional hover/focus dropdown. */
function NavEntry({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const hasChildren = !!item.children?.length;

  return (
    <li className="group relative">
      <Link
        href={item.href}
        className={`flex items-center gap-1 px-3 py-4 text-sm tracking-wide transition-colors label-caps ${
          active ? "text-brand" : "text-ink hover:text-brand"
        }`}
      >
        {item.label}
        {hasChildren && (
          <Icon
            name="chevron-down"
            size={14}
            className="transition-transform group-hover:rotate-180"
          />
        )}
      </Link>

      {hasChildren && (
        <ul className="invisible absolute left-0 top-full z-20 w-56 -translate-y-1 rounded-md border border-line bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {item.children!.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="block px-4 py-2 text-sm text-ink hover:bg-surface-3 hover:text-brand"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * `accountSlot` is rendered by the server (see components/account/AccountMenu)
 * and passed in as a prop, since this component is a Client Component and
 * can't read the session itself.
 */
export default function Navbar({ accountSlot }: { accountSlot?: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  // True once the page's Bygg online section has scrolled up under the
  // header — the sticky bar then slides away so it doesn't cover the
  // configurator, and comes back when you scroll above it again.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const section = document.getElementById(STICKY_RELEASE_ID);

    // One layout read per scroll event; React skips the re-render whenever
    // the answer hasn't changed, which is almost always.
    const update = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      setHidden(
        !!section && section.getBoundingClientRect().top <= headerHeight
      );
    };

    // Deferred a tick so the first check isn't a synchronous setState in the
    // effect; also resets the bar after navigating away from a product page.
    const initial = window.setTimeout(update, 0);
    if (!section) return () => window.clearTimeout(initial);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  const slideAway = hidden && !mobileOpen;

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 bg-surface/95 backdrop-blur transition-transform duration-300 ${
        slideAway ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Utility bar: account */}
      <div className="border-b border-line/70">
        <Container className="flex h-9 items-center justify-end">
          {accountSlot ?? (
            <Link
              href="/mina-sidor"
              className="flex items-center gap-1.5 text-xs tracking-wide text-ink hover:text-brand label-caps"
            >
              Logga in
              <Icon name="user" size={14} />
            </Link>
          )}
        </Container>
      </div>

      {/* Main bar: logo + nav */}
      <Container className="flex items-center justify-between gap-4">
        <div className="py-3">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav aria-label="Huvudmeny" className="hidden lg:block">
          <ul className="flex items-center">
            {mainNav.map((item) => (
              <NavEntry key={item.href} item={item} pathname={pathname} />
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-md p-2 text-ink hover:bg-surface-2 lg:hidden"
          aria-label="Öppna meny"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <Icon name={mobileOpen ? "close" : "menu"} size={22} />
        </button>
      </Container>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav
          aria-label="Mobilmeny"
          className="border-t border-line bg-white lg:hidden"
        >
          <Container className="py-2">
            <ul className="flex flex-col">
              {mainNav.map((item) => (
                <li key={item.href} className="border-b border-line/60 last:border-0">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 text-sm tracking-wide label-caps ${
                      isActive(pathname, item.href)
                        ? "text-brand"
                        : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
