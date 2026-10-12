import "server-only";

import { cache } from "react";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";

/**
 * Real numbers for the admin dashboard.
 *
 * Everything here is counted from the database — the dashboard used to ship
 * with invented figures, which is worse than no figure at all because it
 * looks authoritative. Where a comparison can't honestly be made (no
 * previous month to compare against) the trend is null and the UI shows
 * nothing rather than a made-up percentage.
 *
 * All the counts are one round trip: the neon-http driver opens a fresh HTTP
 * request per query, so a dozen small selects would be a dozen round trips
 * on every dashboard load.
 */

/** Month boundaries follow Swedish local time, not the database's UTC. */
const TZ = "Europe/Stockholm";

interface Counts {
  usersTotal: number;
  usersThisMonth: number;
  usersPrevMonth: number;
  tenants: number;
  listingsTotal: number;
  listingsAttefallshus: number;
  listingsAttefallshusKallare: number;
  listingsThisMonth: number;
  listingsPrevMonth: number;
  applicationsTotal: number;
  applicationsOpen: number;
  applicationsThisMonth: number;
  applicationsPrevMonth: number;
  savedTotal: number;
}

const fetchCounts = cache(async (): Promise<Counts> => {
  const result = await db.execute<Record<string, number>>(sql`
    with b as (
      select
        date_trunc('month', (now() at time zone ${TZ})) as m0,
        date_trunc('month', (now() at time zone ${TZ}) - interval '1 month') as m1
    )
    select
      (select count(*) from users)::int as users_total,
      (select count(*) from users
        where (created_at at time zone ${TZ}) >= b.m0)::int as users_this_month,
      (select count(*) from users
        where (created_at at time zone ${TZ}) >= b.m1
          and (created_at at time zone ${TZ}) < b.m0)::int as users_prev_month,
      (select count(*) from users where customer_number is not null)::int as tenants,
      (select count(*) from listings)::int as listings_total,
      (select count(*) from listings
        where listing_type = 'attefallshus')::int as listings_attefallshus,
      (select count(*) from listings
        where listing_type = 'attefallshus_med_kallare')::int as listings_attefallshus_kallare,
      (select count(*) from listings
        where (created_at at time zone ${TZ}) >= b.m0)::int as listings_this_month,
      (select count(*) from listings
        where (created_at at time zone ${TZ}) >= b.m1
          and (created_at at time zone ${TZ}) < b.m0)::int as listings_prev_month,
      (select count(*) from applications)::int as applications_total,
      (select count(*) from applications
        where status in ('submitted', 'in_review'))::int as applications_open,
      (select count(*) from applications
        where (created_at at time zone ${TZ}) >= b.m0)::int as applications_this_month,
      (select count(*) from applications
        where (created_at at time zone ${TZ}) >= b.m1
          and (created_at at time zone ${TZ}) < b.m0)::int as applications_prev_month,
      (select count(*) from saved_listings)::int as saved_total
    from b
  `);

  const row = result.rows[0] as Record<string, number>;
  return {
    usersTotal: row.users_total,
    usersThisMonth: row.users_this_month,
    usersPrevMonth: row.users_prev_month,
    tenants: row.tenants,
    listingsTotal: row.listings_total,
    listingsAttefallshus: row.listings_attefallshus,
    listingsAttefallshusKallare: row.listings_attefallshus_kallare,
    listingsThisMonth: row.listings_this_month,
    listingsPrevMonth: row.listings_prev_month,
    applicationsTotal: row.applications_total,
    applicationsOpen: row.applications_open,
    applicationsThisMonth: row.applications_this_month,
    applicationsPrevMonth: row.applications_prev_month,
    savedTotal: row.saved_total,
  };
});

export type StatIconKey = "users" | "accounts" | "listings" | "applications";

export interface DashboardStat {
  key: StatIconKey;
  label: string;
  value: number;
  /**
   * Whole-percent change against the previous month, or null when there is
   * no honest baseline — a jump from zero is not "+100 %", it is simply the
   * first one, and the UI says nothing rather than inventing a rate.
   */
  deltaPercent: number | null;
  /** Plain-Swedish context line under the number. */
  note: string;
}

/**
 * Percent change from `previous` to `current`. Null when `previous` is 0,
 * because a change from nothing has no meaningful rate.
 *
 * Every card compares the number it actually displays: an all-time total is
 * measured against what that total stood at on the first of the month, and a
 * this-month figure against the same figure last month. Mixing the two — a
 * total on the face with a month-over-month rate beside it — reads as though
 * the big number fell when it only stopped growing.
 */
function delta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export const getDashboardStats = cache(async (): Promise<DashboardStat[]> => {
  const c = await fetchCounts();

  // Total accounts at the start of this month — the baseline the all-time
  // figure grew from, which is what makes its trend meaningful.
  const usersAtMonthStart = c.usersTotal - c.usersThisMonth;

  return [
    {
      key: "users",
      label: "Totalt antal användare",
      value: c.usersTotal,
      deltaPercent: delta(c.usersTotal, usersAtMonthStart),
      note:
        c.tenants > 0
          ? `varav ${plural(c.tenants, "hyresgäst", "hyresgäster")} med kundnummer`
          : "alla registrerade konton",
    },
    {
      key: "accounts",
      label: "Nya konton denna månad",
      value: c.usersThisMonth,
      deltaPercent: delta(c.usersThisMonth, c.usersPrevMonth),
      note: `${plural(c.usersPrevMonth, "konto", "konton")} förra månaden`,
    },
    {
      key: "listings",
      label: "Publicerade annonser",
      value: c.listingsTotal,
      deltaPercent: delta(c.listingsTotal, c.listingsTotal - c.listingsThisMonth),
      note: `${c.listingsAttefallshus} attefallshus · ${c.listingsAttefallshusKallare} med källare`,
    },
    {
      key: "applications",
      label: "Anmälda ansökningar",
      value: c.applicationsTotal,
      deltaPercent: delta(
        c.applicationsTotal,
        c.applicationsTotal - c.applicationsThisMonth
      ),
      note:
        c.applicationsTotal === 0
          ? "inga ansökningar ännu"
          : plural(c.applicationsOpen, "obehandlad", "obehandlade"),
    },
  ];
});

