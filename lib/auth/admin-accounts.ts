import "server-only";
import { randomUUID } from "crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { isCheckViolation, isUniqueViolation } from "@/lib/db/errors";
import { adminAccounts, MAX_INVITED_ADMINS } from "@/lib/db/schema";
import { hashPassword } from "./password";

/**
 * Data access for invited administrators — the rows in `admin_accounts`.
 *
 * The env-var admin (ADMIN_EMAIL / ADMIN_PASSWORD) is the "root" login and
 * deliberately has no row here, so it can never be revoked from the UI and
 * there is always a way back in. Everything below concerns the up to
 * MAX_INVITED_ADMINS accounts invited on top of it.
 */

/** What the admin list shows. Never includes the password digest. */
export interface AdminSummary {
  id: string;
  email: string;
  invitedBy: string;
  slot: number;
  createdAt: Date;
}

/** The root admin's address, lower-cased, or null when unconfigured. */
export function rootAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

export function isRootAdmin(email: string): boolean {
  const root = rootAdminEmail();
  return root !== null && email.trim().toLowerCase() === root;
}

export async function listAdmins(): Promise<AdminSummary[]> {
  return db
    .select({
      id: adminAccounts.id,
      email: adminAccounts.email,
      invitedBy: adminAccounts.invitedBy,
      slot: adminAccounts.slot,
      createdAt: adminAccounts.createdAt,
    })
    .from(adminAccounts)
    .orderBy(asc(adminAccounts.slot));
}

/** Credentials for the login path. Returns null when no account matches. */
export async function findAdminByEmail(
  email: string
): Promise<{ id: string; email: string; passwordHash: string } | null> {
  const [row] = await db
    .select({
      id: adminAccounts.id,
      email: adminAccounts.email,
      passwordHash: adminAccounts.passwordHash,
    })
    .from(adminAccounts)
    .where(eq(adminAccounts.email, email.trim().toLowerCase()))
    .limit(1);

  return row ?? null;
}

export type InviteOutcome =
  | { ok: true; admin: AdminSummary }
  | { ok: false; reason: "duplicate" | "full" | "error" };

/**
 * Creates an invited administrator.
 *
 * Slot allocation reads the free numbers first, but the read is not what
 * enforces the cap — the CHECK and UNIQUE constraints on `slot` do, so two
 * simultaneous invites can never both succeed into a third account. A lost
 * race surfaces as "full" rather than as a crash.
 */
export async function createAdmin(
  email: string,
  password: string,
  invitedBy: string
): Promise<InviteOutcome> {
  const normalized = email.trim().toLowerCase();

  const used = new Set((await listAdmins()).map((a) => a.slot));
  let slot = 0;
  for (let candidate = 1; candidate <= MAX_INVITED_ADMINS; candidate++) {
    if (!used.has(candidate)) {
      slot = candidate;
      break;
    }
  }
  if (slot === 0) return { ok: false, reason: "full" };

  try {
    const [row] = await db
      .insert(adminAccounts)
      .values({
        id: randomUUID(),
        email: normalized,
        passwordHash: await hashPassword(password),
        invitedBy,
        slot,
      })
      .returning({
        id: adminAccounts.id,
        email: adminAccounts.email,
        invitedBy: adminAccounts.invitedBy,
        slot: adminAccounts.slot,
        createdAt: adminAccounts.createdAt,
      });

    return { ok: true, admin: row };
  } catch (error) {
    // A duplicate slot means someone else claimed it between the read and
    // the insert; a duplicate e-mail means this address is already an admin.
    // Both arrive as 23505, so tell them apart by re-reading.
    if (isUniqueViolation(error)) {
      const existing = await findAdminByEmail(normalized);
      return { ok: false, reason: existing ? "duplicate" : "full" };
    }
    if (isCheckViolation(error)) return { ok: false, reason: "full" };
    // Not logging the error object: drizzle attaches the query parameters,
    // which here include the new administrator's password digest.
    console.error(
      "Admin invite insert failed:",
      error instanceof Error ? error.name : "unknown error"
    );
    return { ok: false, reason: "error" };
  }
}

/** Removes an invited admin, freeing their slot for a future invite. */
export async function deleteAdmin(id: string): Promise<void> {
  await db.delete(adminAccounts).where(eq(adminAccounts.id, id));
}
