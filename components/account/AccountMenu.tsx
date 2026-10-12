import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { getCurrentUser } from "@/lib/auth/user-dal";
import { getSavedCount } from "@/lib/listings/saved";
import AccountDropdown from "./AccountDropdown";

/**
 * The right-hand side of the navbar's utility bar: a plain "Logga in" link
 * when signed out, the account dropdown when signed in.
 *
 * This is the only part of the site chrome that needs the session, so it is
 * kept as its own Server Component and streamed inside <Suspense> — reading
 * cookies in the layout itself would hold every page behind the session
 * lookup. See "Auth and streaming" in the Next.js authentication guide.
 */
export default async function AccountMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/mina-sidor"
        className="flex items-center gap-1.5 text-xs tracking-wide text-ink hover:text-brand label-caps"
      >
        Logga in
        <Icon name="user" size={14} />
      </Link>
    );
  }

  return (
    <AccountDropdown
      firstName={user.firstName}
      email={user.email}
      savedCount={await getSavedCount()}
    />
  );
}

/** Placeholder held in the layout while the session is being read. */
export function AccountMenuFallback() {
  return (
    <span
      aria-hidden
      className="flex items-center gap-1.5 text-xs tracking-wide text-muted/50 label-caps"
    >
      <span className="h-3 w-16 rounded bg-line" />
      <Icon name="user" size={14} />
    </span>
  );
}
