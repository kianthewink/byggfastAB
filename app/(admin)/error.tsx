"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Catches any uncaught exception thrown anywhere in the admin panel so a bug
 * shows this on-brand fallback instead of Next's default developer-facing
 * error screen. Session and validation failures are ordinary return values
 * elsewhere in the app and never reach this boundary — this is only for
 * genuine crashes.
 */
export default function AdminError({
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-panel p-6 text-center text-panel-foreground">
        <h1 className="text-xl font-semibold">Något gick fel</h1>
        <p className="mt-2 text-sm text-panel-muted">
          Ett oväntat fel inträffade i adminpanelen. Prova igen, eller gå
          tillbaka till översikten.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Försök igen
          </button>
          <Link
            href="/administrator"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-card"
          >
            Till översikten
          </Link>
        </div>
      </div>
    </div>
  );
}
