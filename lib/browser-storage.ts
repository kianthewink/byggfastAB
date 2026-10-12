/**
 * localStorage helpers for per-visitor conveniences (remembered kommun,
 * Bygg online choices, the compare list). Every access is wrapped: storage
 * can be blocked or full, and that must never break a page — the visitor
 * just loses the convenience. Client-side only.
 */

/** The kommun last picked anywhere on the site — every price follows it. */
export const KOMMUN_STORAGE_KEY = "bofast-kommun";

export function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / blocked storage: the choice just won't survive a reload.
  }
}
