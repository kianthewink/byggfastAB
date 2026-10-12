"use client";

import { useEffect } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";

/**
 * Catches any uncaught exception thrown while rendering a public-site page
 * so a bug shows this on-brand fallback instead of Next's default
 * developer-facing error screen. Expected errors (wrong password, invalid
 * form input) are handled as ordinary return values elsewhere in the app and
 * never reach this boundary — this is only for genuine crashes.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <h1 className="text-xl text-ink">Något gick fel</h1>
      <p className="mt-2 text-sm text-muted">
        Ett oväntat fel inträffade. Prova igen, eller gå tillbaka till
        startsidan.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-brand px-6 py-2 text-sm text-white transition-colors hover:bg-brand-dark"
        >
          Försök igen
        </button>
        <Link
          href="/"
          className="rounded-md bg-surface-2 px-6 py-2 text-sm text-ink transition-colors hover:bg-brand hover:text-white"
        >
          Till startsidan
        </Link>
      </div>
    </Container>
  );
}
