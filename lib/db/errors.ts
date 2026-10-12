/**
 * Postgres error classification.
 *
 * drizzle-orm wraps every driver error in a `DrizzleQueryError`, so the
 * SQLSTATE code sits on `.cause` (a `NeonDbError`) rather than on the thrown
 * error itself. Checking only the top level silently never matches — hence
 * walking the cause chain.
 */

/** https://www.postgresql.org/docs/current/errcodes-appendix.html */
const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

function hasCode(value: unknown, code: string): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { code?: unknown }).code === code
  );
}

function matchesCode(error: unknown, code: string): boolean {
  // Bounded so a self-referencing cause can't spin forever.
  let current: unknown = error;
  for (let depth = 0; current != null && depth < 5; depth++) {
    if (hasCode(current, code)) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

/** True for a duplicate-key insert, e.g. two people claiming one e-mail. */
export function isUniqueViolation(error: unknown): boolean {
  return matchesCode(error, UNIQUE_VIOLATION);
}

/**
 * True for a CHECK constraint failure — how the database refuses a third
 * administrator, since admin_accounts.slot is constrained to 1..2.
 */
export function isCheckViolation(error: unknown): boolean {
  return matchesCode(error, CHECK_VIOLATION);
}
