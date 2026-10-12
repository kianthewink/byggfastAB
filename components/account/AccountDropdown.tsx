"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { logout } from "@/lib/auth/user-actions";

interface AccountDropdownProps {
  firstName: string;
  email: string;
  savedCount: number;
}

const items = [
  { href: "/mina-sidor", label: "Översikt", icon: "home" as const },
  { href: "/mina-sidor/sparade", label: "Sparade objekt", icon: "heart" as const },
  { href: "/mina-sidor/uppgifter", label: "Mina uppgifter", icon: "user" as const },
];

/**
 * Account menu for a signed-in visitor. Click to open (rather than hover, as
 * the main nav does) because it holds the sign-out action — an accidental
 * hover shouldn't put a logout button under the cursor.
 */
export default function AccountDropdown({
  firstName,
  email,
  savedCount,
}: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Navigating away should never leave the menu hanging open behind the new
  // page. Adjusted during render rather than in an effect — React re-runs
  // this component immediately instead of painting the stale open menu first.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-xs tracking-wide text-ink transition-colors hover:text-brand label-caps"
      >
        <Icon name="user" size={14} />
        {firstName}
        {savedCount > 0 && (
          <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none text-white">
            {savedCount}
          </span>
        )}
        <Icon
          name="chevron-down"
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Mitt konto"
          className="absolute right-0 top-full z-50 mt-1 w-60 rounded-md border border-line bg-white py-1 shadow-lg"
        >
          <p className="truncate border-b border-line px-4 py-2.5 text-xs text-muted">
            Inloggad som
            <span className="mt-0.5 block truncate text-sm text-ink">
              {email}
            </span>
          </p>

          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-surface-3 hover:text-brand"
            >
              <Icon name={item.icon} size={15} className="shrink-0 text-brand" />
              {item.label}
              {item.href === "/mina-sidor/sparade" && savedCount > 0 && (
                <span className="ml-auto text-xs text-muted">{savedCount}</span>
              )}
            </Link>
          ))}

          <form action={logout} className="border-t border-line">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-ink hover:bg-surface-3 hover:text-brand"
            >
              <Icon name="lock" size={15} className="shrink-0 text-brand" />
              Logga ut
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
