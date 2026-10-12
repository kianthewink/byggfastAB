import { login } from "@/lib/auth/actions";

export const metadata = {
  title: "Logga in — Adminpanel",
};

export default async function LoggaInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-panel p-6 text-panel-foreground">
        <h1 className="text-xl font-semibold">Adminpanel</h1>
        <p className="mt-1 text-sm text-panel-muted">
          Logga in för att fortsätta
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
            Fel e-postadress eller lösenord.
          </p>
        )}

        <form action={login} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            E-postadress
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lösenord
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Logga in
          </button>
        </form>
      </div>
    </div>
  );
}
