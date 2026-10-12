import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { adminSecrets, INVITE_PIN_KEY } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { PIN_LENGTH, isValidPinFormat } from "./pin-format";

/**
 * The six-digit PIN that gates administrator invites.
 *
 * The PIN is never stored in clear text anywhere. It lives as a scrypt
 * digest in `admin_secrets` — deliberately unlike ADMIN_PASSWORD, which sits
 * in .env.local as plain text by design. ADMIN_INVITE_PIN is only ever a
 * bootstrap value: the first time the PIN is needed it is hashed into the
 * database, and from then on the database row is the source of truth. You
 * can delete the env var afterwards.
 */

export { PIN_LENGTH, isValidPinFormat };

/**
 * Brute-force throttle. A six-digit PIN is only a million combinations, and
 * while scrypt already caps guessing at roughly a dozen per second, that is
 * not on its own a defence worth relying on.
 *
 * Deliberately in-memory: the gate already sits behind an authenticated
 * admin session, so the attacker must have a valid admin cookie before they
 * can reach it at all, and a per-process counter is proportionate to that.
 * It resets on redeploy and is not shared between serverless instances —
 * move it to a table if the PIN ever becomes reachable to anyone unsigned-in.
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
let failedAttempts = 0;
let lockedUntil = 0;

function isLockedOut(): boolean {
  if (lockedUntil === 0) return false;
  if (Date.now() < lockedUntil) return true;
  // Lockout expired — start the next window from a clean slate.
  lockedUntil = 0;
  failedAttempts = 0;
  return false;
}

/** Minutes left on the current lockout, rounded up. 0 when not locked. */
export function lockoutMinutesRemaining(): number {
  if (!isLockedOut()) return 0;
  return Math.ceil((lockedUntil - Date.now()) / 60000);
}

async function readPinHash(): Promise<string | null> {
  const [row] = await db
    .select({ valueHash: adminSecrets.valueHash })
    .from(adminSecrets)
    .where(eq(adminSecrets.key, INVITE_PIN_KEY))
    .limit(1);

  if (row) return row.valueHash;

  // Not set up yet: fall back to the env bootstrap, hashing it on the way in
  // so the clear-text value never lands in a column.
  const seed = process.env.ADMIN_INVITE_PIN?.trim();
  if (!seed || !isValidPinFormat(seed)) return null;

  const valueHash = await hashPassword(seed);
  await db
    .insert(adminSecrets)
    .values({ key: INVITE_PIN_KEY, valueHash })
    // Another request may have bootstrapped it a moment ago; theirs wins and
    // we re-read rather than overwriting a PIN that may already have been
    // rotated away from the env value.
    .onConflictDoNothing();

  const [stored] = await db
    .select({ valueHash: adminSecrets.valueHash })
    .from(adminSecrets)
    .where(eq(adminSecrets.key, INVITE_PIN_KEY))
    .limit(1);

  return stored?.valueHash ?? null;
}

/** Whether a PIN exists at all — drives the "set one up first" UI state. */
export async function isInvitePinConfigured(): Promise<boolean> {
  return (await readPinHash()) !== null;
}

export type PinResult = "ok" | "wrong" | "unconfigured" | "locked";

/** Constant-time check of a submitted PIN against the stored digest. */
export async function verifyInvitePin(pin: string): Promise<PinResult> {
  if (isLockedOut()) return "locked";

  const stored = await readPinHash();
  if (stored === null) return "unconfigured";

  // Format is checked after the hash lookup so a malformed PIN costs the
  // same as a well-formed wrong one, and still counts as a failed attempt.
  const ok = isValidPinFormat(pin) && (await verifyPassword(pin, stored));

  if (!ok) {
    failedAttempts += 1;
    if (failedAttempts >= MAX_ATTEMPTS) lockedUntil = Date.now() + LOCKOUT_MS;
    return "wrong";
  }

  failedAttempts = 0;
  lockedUntil = 0;
  return "ok";
}

/** Sets or rotates the PIN. Callers must have verified the current one. */
export async function setInvitePin(pin: string): Promise<void> {
  if (!isValidPinFormat(pin)) {
    throw new Error("PIN-koden måste vara exakt sex siffror.");
  }
  const valueHash = await hashPassword(pin);
  await db
    .insert(adminSecrets)
    .values({ key: INVITE_PIN_KEY, valueHash })
    .onConflictDoUpdate({
      target: adminSecrets.key,
      set: { valueHash, updatedAt: new Date() },
    });
  failedAttempts = 0;
  lockedUntil = 0;
}
