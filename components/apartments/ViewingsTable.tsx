import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Viewing } from "@/lib/types";

/** Upcoming viewing slots on the apartment product page, one card per slot. */
export default function ViewingsTable({ viewings }: { viewings: Viewing[] }) {
  return (
    <div>
      <h2 className="text-lg text-brand">Visningstider</h2>
      <ul className="mt-3 space-y-2">
        {viewings.map((viewing) => (
          <li key={`${viewing.date}-${viewing.time}`}>
            <Link
              href="/mina-sidor"
              className="flex items-center gap-3 rounded-md border border-line bg-white px-4 py-3 shadow-sm transition-colors hover:border-brand-light/60 hover:bg-surface-3"
            >
              <Icon name="calendar" size={18} className="shrink-0 text-brand" />
              <span className="flex-1">
                <span className="block text-sm text-ink">
                  {viewing.date} kl {viewing.time}
                </span>
                <span className="block text-xs text-muted">
                  Till anmälan och mer info
                </span>
              </span>
              <Icon name="chevron-right" size={16} className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
