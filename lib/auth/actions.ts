"use server";

import { randomBytes, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { findAdminByEmail, listAdmins } from "./admin-accounts";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

/**
 * Admin sign-in. Two kinds of account can get through here:
 *
 *   - the root admin, whose credentials are ADMIN_EMAIL / ADMIN_PASSWORD in
 *     the environment and who has no database row, and
 *   - administrators invited from the panel, who live in `admin_accounts`
 *     with a scrypt-hashed password.
 *
 * Both end up with the same session cookie and the same privileges; the
 * split exists only so there is always one login that cannot be revoked
 * from inside the UI.
 */

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Buffers must be equal length for timingSafeEqual; a length mismatch is
  // already a "no match" so it's fine to bail without the timing-safe path.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * A real scrypt digest of a value nobody can supply, verified against when
 * no invited admin matches so a wrong e-mail costs the same as a wrong
 * password. Mirrors the same guard on the visitor login in user-actions.ts.
 */
let dummyHash: Promise<string> | undefined;

function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(32).toString("hex"));
  return dummyHash;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const rootEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const rootPassword = process.env.ADMIN_PASSWORD;

  // With no root credentials and no invited admins there is nobody who could
  // ever sign in, which is a setup mistake rather than a failed login.
  if ((!rootEmail || !rootPassword) && (await listAdmins()).length === 0) {
    throw new Error(
      "ADMIN_EMAIL / ADMIN_PASSWORD är inte satta. Kopiera .env.example till .env.local och fyll i dem."
    );
  }

  if (
    rootEmail &&
    rootPassword &&
    email === rootEmail &&
    safeCompare(password, rootPassword)
  ) {
    await createSession(rootEmail);
    // Outside any try/catch on purpose — redirect() signals by throwing.
    redirect("/administrator");
  }

  const account = await findAdminByEmail(email);
  const passwordOk = await verifyPassword(
    password,
    account?.passwordHash ?? (await getDummyHash())
  );

  if (account && passwordOk) {
    await createSession(account.email);
    redirect("/administrator");
  }

  redirect("/administrator/logga-in?error=1");
}

export async function logout() {
  await destroySession();
  redirect("/administrator/logga-in");
}
