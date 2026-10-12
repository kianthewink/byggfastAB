import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { ListingDocument } from "../listings/spec-sections";
import type { BuildQuote, PurchasePackage } from "../build/types";

export const listingTypeEnum = pgEnum("listing_type", [
  "attefallshus",
  "attefallshus_med_kallare",
]);

export type Viewing = {
  date: string;
  time: string;
};

export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  listingType: listingTypeEnum("listing_type").notNull(),
  sourceCollection: text("source_collection"),
  city: text("city").notNull(),
  rooms: integer("rooms").notNull(),
  area: integer("area").notNull(),
  areaMax: integer("area_max"),
  rent: integer("rent").notNull(),
  available: text("available"),
  floor: integer("floor"),
  floorsTotal: integer("floors_total"),
  elevator: boolean("elevator"),
  buildYear: integer("build_year"),
  // Mått — shown as "40 m² + 9.87 m² loft · 10.83 x 3.69 x 4.15 m · 2" on
  // the product page.
  loftArea: doublePrecision("loft_area"),
  length: doublePrecision("length"),
  width: doublePrecision("width"),
  height: doublePrecision("height"),
  bedrooms: integer("bedrooms"),
  documents: jsonb("documents").$type<ListingDocument[]>().notNull().default([]),
  /** Köpalternativ in the product page's purchase box — see lib/build/types.ts. */
  packages: jsonb("packages").$type<PurchasePackage[]>().notNull().default([]),
  // Teknisk specifikation — one column per accordion section, see
  // lib/listings/spec-sections.ts.
  specTak: jsonb("spec_tak").$type<string[]>().notNull().default([]),
  specTakdimensionering: jsonb("spec_takdimensionering").$type<string[]>().notNull().default([]),
  specYttervagg: jsonb("spec_yttervagg").$type<string[]>().notNull().default([]),
  specGolvbjalklag: jsonb("spec_golvbjalklag").$type<string[]>().notNull().default([]),
  specGolvbjalklagVatrum: jsonb("spec_golvbjalklag_vatrum").$type<string[]>().notNull().default([]),
  specMellanbjalklag: jsonb("spec_mellanbjalklag").$type<string[]>().notNull().default([]),
  specInnervagg: jsonb("spec_innervagg").$type<string[]>().notNull().default([]),
  specInnervaggVatrum: jsonb("spec_innervagg_vatrum").$type<string[]>().notNull().default([]),
  // Installation & montering — same shape.
  installUtvandigMalning: jsonb("install_utvandig_malning").$type<string[]>().notNull().default([]),
  installFonsterDorrar: jsonb("install_fonster_dorrar").$type<string[]>().notNull().default([]),
  installPlat: jsonb("install_plat").$type<string[]>().notNull().default([]),
  installAvvattning: jsonb("install_avvattning").$type<string[]>().notNull().default([]),
  installUppvarmning: jsonb("install_uppvarmning").$type<string[]>().notNull().default([]),
  installVentilation: jsonb("install_ventilation").$type<string[]>().notNull().default([]),
  installBadrum: jsonb("install_badrum").$type<string[]>().notNull().default([]),
  installKok: jsonb("install_kok").$type<string[]>().notNull().default([]),
  description: text("description").notNull().default(""),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  viewings: jsonb("viewings").$type<Viewing[]>().notNull().default([]),
  contacts: text("contacts"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ListingRow = typeof listings.$inferSelect;
export type NewListingRow = typeof listings.$inferInsert;

/** UI-facing shape — a DB row minus bookkeeping timestamps. */
export type Listing = Omit<ListingRow, "createdAt" | "updatedAt">;

/**
 * Site visitors with an account — people in the housing queue
 * ("bostadssökande") who signed up at /mina-sidor/registrera, plus existing
 * tenants the office has issued a customer number to.
 *
 * This is a different population from the single admin login in
 * lib/auth/actions.ts, which is env-var based and has no row here. Never
 * conflate the two — see lib/auth/token.ts for how the two session kinds
 * are kept apart.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  /** Always stored lower-cased; every lookup lower-cases first. */
  email: text("email").notNull().unique(),
  /** scrypt digest from lib/auth/password.ts — never a plaintext password. */
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  street: text("street"),
  postalCode: text("postal_code"),
  city: text("city"),
  /**
   * Kundnummer from the rent invoice. Null for self-registered applicants;
   * the office fills it in when someone becomes a tenant, which then lets
   * them log in with it instead of their e-mail.
   */
  customerNumber: text("customer_number").unique(),
  /** Start of the queue time ("köplats") shown on Mina sidor. */
  queueStartedAt: timestamp("queue_started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

/** Listings a user has hearted. Join table, one row per saved listing. */
export const savedListings = pgTable(
  "saved_listings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.listingId] }),
    // "Everything this user saved" is the only other access pattern, and the
    // primary key already leads with user_id, so one index on listing_id is
    // enough to keep the cascade delete from a listing removal cheap.
    index("saved_listings_listing_id_idx").on(table.listingId),
  ]
);

export type SavedListingRow = typeof savedListings.$inferSelect;

/** How many invited admins may exist alongside the env-var root admin. */
export const MAX_INVITED_ADMINS = 2;

/**
 * Extra administrators invited from the admin panel, on top of the single
 * env-var admin in lib/auth/actions.ts.
 *
 * That env admin is the "root" login and has no row here — it can never be
 * revoked from the UI, so there is always a way back in even if every
 * invited account is deleted.
 *
 * The MAX_INVITED_ADMINS cap is enforced by the database, not by a
 * count-then-insert in application code: the neon-http driver has no
 * interactive transactions, so two concurrent invites could both read
 * "1 admin exists" and both insert. Instead every row claims a numbered
 * `slot`, unique and CHECK-constrained to 1..MAX_INVITED_ADMINS, so a third
 * invite can only ever fail — either the CHECK rejects the slot number or
 * the unique index rejects the duplicate.
 */
export const adminAccounts = pgTable(
  "admin_accounts",
  {
    id: text("id").primaryKey(),
    /** Always stored lower-cased; every lookup lower-cases first. */
    email: text("email").notNull().unique(),
    /** scrypt digest from lib/auth/password.ts — never a plaintext password. */
    passwordHash: text("password_hash").notNull(),
    /** E-mail of the admin who issued the invite, kept as an audit trail. */
    invitedBy: text("invited_by").notNull(),
    /** 1..MAX_INVITED_ADMINS. Freed for reuse when an admin is revoked. */
    slot: integer("slot").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "admin_accounts_slot_range",
      sql`${table.slot} >= 1 and ${table.slot} <= ${sql.raw(String(MAX_INVITED_ADMINS))}`
    ),
  ]
);

export type AdminAccountRow = typeof adminAccounts.$inferSelect;

/**
 * Key/value store for admin secrets that must not sit in plaintext.
 *
 * Today it holds exactly one row — the scrypt digest of the six-digit PIN
 * that gates administrator invites. It is a table rather than an env var
 * precisely so the PIN is stored hashed: ADMIN_PASSWORD is plaintext in
 * .env.local by design, and the PIN deliberately is not.
 */
export const adminSecrets = pgTable("admin_secrets", {
  key: text("key").primaryKey(),
  /** scrypt digest, same format as users.password_hash. */
  valueHash: text("value_hash").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AdminSecretRow = typeof adminSecrets.$inferSelect;

/** Row key for the invite PIN in `admin_secrets`. */
export const INVITE_PIN_KEY = "invite_pin";

export const applicationStatusEnum = pgEnum("application_status", [
  "submitted",
  "in_review",
  "accepted",
  "rejected",
]);

/**
 * "Anmälda ansökningar" — a signed-in visitor registering interest in one
 * specific listing.
 *
 * The public "Anmäl intresse" button does not write here yet; the table and
 * the admin-side count exist first so the dashboard reports a real number
 * rather than a hard-coded one, and wiring the button up later is a pure
 * addition with no schema change.
 */
export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").notNull().default("submitted"),
    /** Optional free text the applicant adds to their application. */
    message: text("message"),
    /**
     * The kommun, package and Bygg online choices the applicant had picked,
     * priced at the moment they sent it. Null for applications sent before
     * the configurator existed.
     */
    configuration: jsonb("configuration").$type<BuildQuote>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Applying to the same listing twice is a double-click, not a second
    // application — the unique index turns it into a no-op upsert target.
    uniqueIndex("applications_user_listing_idx").on(
      table.userId,
      table.listingId
    ),
    index("applications_listing_id_idx").on(table.listingId),
    // The dashboard's "anmälda ansökningar" count filters on status.
    index("applications_status_idx").on(table.status),
  ]
);

export type ApplicationRow = typeof applications.$inferSelect;

/**
 * A visitor's review of a listing, shown on its public detail page —
 * "read-only" for now: there is no submission form yet, only the display,
 * sorting, and star-breakdown UI. `userId` is nullable on purpose so that
 * feature can attach a real signed-in user later without a migration, but
 * nothing requires one today (the seeded sample reviews have none).
 */
export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    /** Null for every review today — see the table comment. */
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    /** Shown as the byline. Independent of `userId` so a review never loses
     *  its author's name if the account behind it is later deleted. */
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(),
    /** Optional short headline, as on Amazon's reviews — most reviews have
     *  one, but it's not required. */
    title: text("title"),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("reviews_listing_id_idx").on(table.listingId),
    check("reviews_rating_range", sql`${table.rating} >= 1 and ${table.rating} <= 5`),
  ]
);

export type ReviewRow = typeof reviews.$inferSelect;

/**
 * Site-wide settings edited in the admin panel, one jsonb document per key.
 * A document rather than normalized tables because each one is edited and
 * saved as a whole, and the neon-http driver has no transactions — a single
 * row write is the only way to save a nested tree atomically.
 *
 * Keys in use: see BUILD_SETTINGS_KEYS in lib/build/settings.ts.
 */
export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
