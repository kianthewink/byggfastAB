"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import Icon from "@/components/ui/Icon";
import { MAX_COMPARE, compareHref } from "@/lib/compare";
import { useCompare } from "./CompareProvider";

/**
 * Pinned to the bottom of every public page once something is picked for
 * comparison: the chosen houses, empty slots up to the limit, and the way
 * through to /jamfor. Not shown on /jamfor itself.
 */
export default function CompareBar() {
  const { items, remove, clear } = useCompare();
  const pathname = usePathname();
  if (items.length === 0 || pathname === "/jamfor") return null;

  const canCompare = items.length >= 2;

  return (
    <>
      {/* Keeps the footer reachable above the fixed bar. */}
      <div aria-hidden className="h-28" />

      <div className="panel-rise-in fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
          <p className="flex items-center gap-2 text-sm text-ink">
            <Icon name="compare" size={18} className="text-brand" />
            Jämför ({items.length}/{MAX_COMPARE})
          </p>

          <ul className="flex flex-1 gap-2 overflow-x-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex shrink-0 items-center gap-2 rounded-md border border-line bg-surface-3 py-1 pl-1 pr-1.5"
              >
                <span className="relative size-10 overflow-hidden rounded">
                  <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="max-w-36 truncate text-xs text-ink">{item.title}</span>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Ta bort ${item.title} från jämförelsen`}
                  className="flex size-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-white hover:text-ink"
                >
                  <Icon name="close" size={14} />
                </button>
              </li>
            ))}
            {Array.from({ length: MAX_COMPARE - items.length }, (_, i) => (
              <li
                key={`empty-${i}`}
                className="hidden size-12 shrink-0 rounded-md border border-dashed border-line sm:block"
                aria-hidden
              />
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clear}
              className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Rensa
            </button>
            {canCompare ? (
              <Link
                href={compareHref(items.map((i) => i.id))}
                className="rounded-md bg-brand px-5 py-2.5 text-sm text-white transition-colors hover:bg-brand-dark"
              >
                Jämför {items.length} hus
              </Link>
            ) : (
              <span className="rounded-md bg-surface-2 px-5 py-2.5 text-sm text-muted">
                Välj ett hus till
              </span>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}
