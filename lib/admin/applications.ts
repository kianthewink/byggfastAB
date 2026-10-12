import "server-only";

import { cache } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { applications, listings, users } from "@/lib/db/schema";
import type { BuildQuote } from "@/lib/build/types";

export type ApplicationStatus =
  | "submitted"
  | "in_review"
  | "accepted"
  | "rejected";

export interface ApplicationListItem {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: Date;
  /** Last time the applicant re-sent it with changed choices. */
  updatedAt: Date;
  userName: string;
  userEmail: string;
  /** Required at signup; null only for accounts created before that. */
  userPhone: string | null;
  customerNumber: string | null;
  listingId: string;
  listingCity: string;
  listingType: "attefallshus" | "attefallshus_med_kallare";
  /** Kommun, package and Bygg online choices as quoted when sent. */
  configuration: BuildQuote | null;
}

/**
 * Every "anmäl intresse" submission, newest activity first, for the admin
 * panel's Ansökningar page — who applied, how to reach them, for which
 * listing, and what they configured.
 *
 * Inner-joined on purpose: an application without its user or listing row
 * would mean a foreign key was violated, which the schema's `onDelete:
 * cascade` on both columns rules out — a dangling application can't exist.
 */
export const listApplicationsForAdmin = cache(
  async (): Promise<ApplicationListItem[]> => {
    const rows = await db
      .select({
        id: applications.id,
        status: applications.status,
        message: applications.message,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        configuration: applications.configuration,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        userPhone: users.phone,
        customerNumber: users.customerNumber,
        listingId: listings.id,
        listingCity: listings.city,
        listingType: listings.listingType,
      })
      .from(applications)
      .innerJoin(users, eq(users.id, applications.userId))
      .innerJoin(listings, eq(listings.id, applications.listingId))
      .orderBy(desc(applications.updatedAt));

    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      message: row.message,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      configuration: row.configuration,
      userName: `${row.userFirstName} ${row.userLastName}`,
      userEmail: row.userEmail,
      userPhone: row.userPhone,
      customerNumber: row.customerNumber,
      listingId: row.listingId,
      listingCity: row.listingCity,
      listingType: row.listingType,
    }));
  }
);
