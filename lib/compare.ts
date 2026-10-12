/**
 * Shared by the compare UI (client) and the /jamfor page (server). Kept out
 * of the "use client" provider: a server component importing from a client
 * module gets references, not values.
 */

/** How many houses fit side by side in the comparison. */
export const MAX_COMPARE = 4;

/** "/jamfor?ids=a,b,c" — shareable, and what the page renders from. */
export function compareHref(ids: string[]): string {
  return ids.length ? `/jamfor?ids=${ids.map(encodeURIComponent).join(",")}` : "/jamfor";
}

/** Reads the ids back out of ?ids=…, de-duplicated and capped. */
export function parseCompareIds(raw: string | string[] | undefined): string[] {
  const joined = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  return [
    ...new Set(
      joined
        .split(",")
        .map((id) => id.trim())
        .filter((id) => /^[a-zA-Z0-9_-]{1,200}$/.test(id))
    ),
  ].slice(0, MAX_COMPARE);
}
