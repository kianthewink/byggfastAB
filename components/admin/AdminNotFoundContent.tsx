import Link from "next/link";

/**
 * Body of the admin 404 state, shared by app/(admin)/not-found.tsx (an
 * explicit notFound() call from within an admin page) and the admin branch
 * of the root app/not-found.tsx (a genuinely unmatched /administrator URL —
 * see that file for why the root one needs to handle this case too).
 */
export default function AdminNotFoundContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
      <p className="text-5xl font-bold text-accent">404</p>
      <div>
        <h1 className="text-xl font-semibold">Sidan kunde inte hittas</h1>
        <p className="mt-2 text-sm text-panel-muted">
          Sidan du letar efter finns inte eller har flyttats.
        </p>
      </div>
      <Link
        href="/administrator"
        className="mt-2 inline-flex rounded-lg bg-accent px-6 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Till översikten
      </Link>
    </div>
  );
}
