# BYGGFAST AB

The public BOFAST site and its admin panel in one Next.js app. Listings are
stored in Postgres, edited in the admin panel, and rendered on the public
site — there is no static listing data any more.

Built by merging two former projects:

| Was                | Is now                                          |
| ------------------ | ----------------------------------------------- |
| `Code/BofastAB`    | the public site — `app/(site)`, `components/`    |
| `Code/admin`       | the admin panel — `app/(admin)`, `lib/db`, `lib/auth` |

## Getting started

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill it in (`DATABASE_URL`,
`AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_INVITE_PIN` if you
want to invite extra administrators), then:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

- Public site — http://localhost:3000
- Admin panel — http://localhost:3000/administrator (sign in at
  `/administrator/logga-in`)

The admin panel is written in Swedish. Its routes moved from `/admin` to
`/administrator`; the old paths still 307-redirect, so existing bookmarks keep
working (see `redirects()` in `next.config.ts`).

## How the two halves fit together

```
app/
  layout.tsx              <html>/<body> + fonts, nothing else
  site.css                BOFAST design tokens  ── loaded only by (site)
  admin.css               admin tokens + dark mode ── loaded only by (admin)
  (site)/                 public routes: /, /attefallshus, /attefallshus-med-kallare, …
  (admin)/
    administrator/
      logga-in/           open — the one admin route outside the auth gate
      (dashboard)/        behind verifySession(): översikt, innehall, skapa,
                          importera, administratorer
lib/
  db/                     drizzle schema, Neon client, seed data
  auth/                   JWT cookie session (dal / session / token / actions)
                          + admin-accounts, invite-pin for invited admins
  admin/stats.ts          the dashboard's real counts and activity feed
  listings/               ← the bridge: DB rows → the site's Apartment shape
  storage.ts              image uploads (Vercel Blob, or public/uploads locally)
proxy.ts                  redirects unauthenticated /administrator/* to the
                          login page (optimistic only — dal.ts is the real gate)
```

The two stylesheets are imported by their own route group layout, so the
admin's tokens (`bg-panel`, `text-foreground`, dark mode) and the site's
tokens (`bg-brand`, `text-ink`, `bg-surface`) never collide, and neither
loads on the other's pages.

### Where listing data comes from

`lib/listings/queries.ts` is the public site's only source of listings. It
reads the `listings` table and maps rows through `lib/listings/map.ts` into
the `Apartment` type the site's components already expected:

- `listing_type = 'attefallshus'` → `/attefallshus`
- `listing_type = 'attefallshus_med_kallare'` → `/attefallshus-med-kallare`
- nullable columns → optional properties
- `contacts` free text → `ListingContact[]`, falling back to the shared
  BOFAST contact block (`data/contacts.ts`) when the field is empty or holds
  the legacy `BOFAST_CONTACTS` marker
- a listing with no images falls back to `public/placeholder-listing.svg`

Writes stay in the admin panel, behind `verifySession()` — see
`app/(admin)/administrator/(dashboard)/innehall/actions.ts`.

### Who can sign in to the admin panel

Two kinds of account, both landing on the same session cookie:

- **The root admin** — `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the environment.
  It has no database row and cannot be removed from inside the panel, so
  there is always a way back in.
- **Invited administrators** — up to `MAX_INVITED_ADMINS` (2) rows in
  `admin_accounts`, created on `/administrator/administratorer` with a
  scrypt-hashed password.

Inviting or removing one requires a six-digit PIN. The PIN is *never* stored
in clear text: `ADMIN_INVITE_PIN` is only a bootstrap value, hashed with
scrypt into `admin_secrets` the first time it is used, after which the
database row is the source of truth and the PIN can be rotated from the UI.
The PIN travels with every mutating call and is re-verified server-side —
unlocking the form in the browser grants nothing on its own.

The cap is enforced by the database rather than by a count-then-insert:
`admin_accounts.slot` is UNIQUE and CHECK-constrained to `1..2`, so two
concurrent invites can never both land a third administrator. That matters
because the neon-http driver has no interactive transactions.

`verifySession()` re-checks the account against the database on every
request, not just the JWT signature — otherwise a revoked administrator would
keep full access for the remaining week of their cookie's life.

### Caching

The four listing routes are `force-dynamic`, so anything published in the
admin panel is live on the next page load. If you'd rather have cached pages,
swap `export const dynamic = "force-dynamic"` for `export const revalidate =
300` and call `revalidatePath("/attefallshus")` (and friends) from the
admin actions — same app, so it just works.

### Images

Uploads go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, otherwise to
`public/uploads/listings/`. Because the admin and the site are now one app,
locally-stored uploads are served to the public site directly — that was not
possible when they were two separate deployments.

## Scripts

| Script                | What it does                                  |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | dev server (site + admin)                     |
| `npm run build`       | production build                              |
| `npm run db:generate` | generate a migration from `lib/db/schema.ts`  |
| `npm run db:migrate`  | apply migrations                              |
| `npm run db:push`     | push schema straight to the database          |
| `npm run db:studio`   | Drizzle Studio                                |
| `npm run db:seed`     | seed/refresh the sample listings              |
| `npm run check:auth`  | sessions, password hashing, redirect + form validation |
| `npm run check:admin` | administrator invites, the PIN, and the 2-admin cap |

Both check scripts are self-contained and print a PASS/FAIL list.
`check:admin` writes to `admin_accounts` / `admin_secrets` and restores both
to exactly how it found them.

## Still static

Only listings are database-backed. News, FAQ, hero slides, feature cards,
practical info and company details still live in `data/` as TypeScript
files — the admin panel has no editor for them yet.

## Not finished yet

The `applications` table ("anmälda ansökningar") exists and the dashboard
counts it for real, but nothing writes to it: the public "Anmäl intresse"
button on a listing page still just links to `/mina-sidor`. Wiring that
button to a server action is a pure addition — the schema, the index and the
dashboard card are already in place, so the count starts reporting the moment
the first row is written.

`scripts/legacy/import_listings.py` is the old spreadsheet→TypeScript
importer from the standalone front-end. It is superseded by the admin panel's
Import page and is kept only for reference; it is not wired to an npm script.
