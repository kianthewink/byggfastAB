import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { USER_SESSION_COOKIE, verifyUserToken } from "./token";

/**
 * Data access layer for signed-in site visitors — the counterpart to
 * lib/auth/dal.ts, which guards the admin panel.
 *
 * Unlike the admin routes there is no proxy check in front of these: every
 * /mina-sidor page and every Server Action that touches user data calls
 * requireUser() (or getCurrentUser() where being logged out is a valid
 * state), so the authorization check sits right next to the data.
 */

/** The signed cookie, verified but not yet resolved against the database. */
const readSession = cache(async () => {
  const store = await cookies();
  const token = store.get(USER_SESSION_COOKIE)?.value;
  return token ? verifyUserToken(token) : null;
});

/**
 * The subset of a user row that is safe to hand to the UI — everything
 * except the password hash. Selected column-by-column so adding a sensitive
 * column later can't silently leak it into a client component.
 */
export interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  customerNumber: string | null;
  queueStartedAt: Date;
}

/**
 * The current visitor, or null when signed out. Also returns null when the
 * cookie is valid but the account no longer exists, so a deleted user's
 * lingering cookie can't keep a session alive.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSession();
  if (!session) return null;

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phone: users.phone,
      street: users.street,
      postalCode: users.postalCode,
      city: users.city,
      customerNumber: users.customerNumber,
      queueStartedAt: users.queueStartedAt,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return row ?? null;
});

/** Same, but sends signed-out visitors to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/mina-sidor");
  }
  return user;
}
