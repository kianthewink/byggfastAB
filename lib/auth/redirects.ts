/**
 * Post-login redirect targets.
 *
 * A "starts with / but not //" check is NOT enough. For special schemes the
 * WHATWG URL parser treats a backslash exactly like a slash, and it strips
 * tab/CR/LF before parsing — so all of these resolve to a foreign origin
 * while passing the naive test:
 *
 *   /\evil.com      ->  https://evil.com/
 *   /\/evil.com     ->  https://evil.com/
 *   /<TAB>/evil.com ->  https://evil.com/     (?next=/%09/evil.com)
 *
 * The only check worth trusting is resolving the value and comparing origins,
 * which is what this does. Everything else is a cheap pre-filter.
 */

/** Any base works; it just has to be one no attacker can name. */
const RESOLUTION_BASE = "https://redirect-check.invalid";

/**
 * Returns `value` when it is a safe same-origin path, otherwise `fallback`.
 * Accepts `unknown` because it is fed straight from search params, where a
 * repeated key (`?next=/a&next=/b`) arrives as an array, not a string.
 */
export function safeRedirectPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value.length === 0) return fallback;

  // Characters the URL parser removes or reinterprets before we get a say.
  if (/[\\\t\n\r]/.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  let url: URL;
  try {
    url = new URL(value, RESOLUTION_BASE);
  } catch {
    return fallback;
  }

  if (url.origin !== RESOLUTION_BASE) return fallback;

  // Rebuilt from the parsed URL rather than returned verbatim, so what we
  // hand to redirect() is exactly what the parser agreed was same-origin.
  return `${url.pathname}${url.search}${url.hash}`;
}
