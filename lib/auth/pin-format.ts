/**
 * Shape of the invite PIN, shared by the server-side verifier and the client
 * form. Deliberately its own module with no "server-only" import: the input
 * field needs the length and digit rule to give immediate feedback, while
 * everything that touches the stored digest stays in lib/auth/invite-pin.ts.
 */

export const PIN_LENGTH = 6;

const PIN_PATTERN = /^\d{6}$/;

/** Exactly six digits — no spaces, no separators. */
export function isValidPinFormat(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}
