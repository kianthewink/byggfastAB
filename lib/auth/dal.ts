import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { findAdminByEmail, isRootAdmin } from "./admin-accounts";
import { SESSION_COOKIE, verifySessionToken } from "./token";

/**
 * The real authorization boundary. proxy.ts only does an optimistic
 * redirect; call this at the top of every protected Server Component page
 * and every Server Action that reads or mutates data, per Next's DAL
 * guidance — proxy alone is not a sufficient security check.
 *
 * A valid signature is not enough on its own. Admin sessions last a week, so
 * an administrator revoked on the Administratörer page would otherwise keep
 * full access with the cookie they already hold until it expired. The
 * account is therefore re-checked against the database on every request:
 * either the address is the root admin from the environment, or it still has
 * a row in `admin_accounts`. React's cache() keeps that to one lookup per
 * request no matter how many callers ask.
 */
export const verifySession = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/administrator/logga-in");
  }

  const stillAnAdmin =
    isRootAdmin(session.email) ||
    (await findAdminByEmail(session.email)) !== null;

  if (!stillAnAdmin) {
    redirect("/administrator/logga-in");
  }

  return session;
});
