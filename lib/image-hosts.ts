/**
 * Single source of truth for which image hosts next/image is allowed to
 * fetch and optimize from.
 *
 * Why this exists: an admin import once brought in a listing photo hosted on
 * a domain that wasn't in next.config.ts's `images.remotePatterns`.
 * next/image throws — synchronously, during render — for any `src` whose
 * host isn't allow-listed, and that one bad URL crashed the *entire*
 * /attefallshus page for every visitor, not just the one listing. A
 * single stray value in one spreadsheet cell should never be able to take
 * the whole public site down.
 *
 * Two things now use this list instead of hardcoding their own:
 *  - next.config.ts builds `images.remotePatterns` from it, so the app
 *    still refuses to fetch images from hosts we haven't reviewed.
 *  - lib/listings/map.ts's toApartment() runs every image URL through
 *    isAllowedImageHost() before it ever reaches a page, and silently drops
 *    (falls back to a placeholder for) anything that isn't allowed — so
 *    unreviewed data degrades a photo, it doesn't crash a page.
 *
 * Adding a new legitimate host (e.g. a new CDN) means updating this one
 * file — both call sites pick it up automatically.
 */

export interface ImageHostPattern {
  protocol: "https";
  /** Either an exact hostname, or a `**.` prefix matching any subdomain. */
  hostname: string;
}

export const IMAGE_REMOTE_PATTERNS: ImageHostPattern[] = [
  // Sample listing images in the seed data.
  { protocol: "https", hostname: "picsum.photos" },
  // The client's own production image host — where most imported listing
  // photos actually live (see the incident note above).
  { protocol: "https", hostname: "www.bofast.se" },
  // Admin uploads when BLOB_READ_WRITE_TOKEN is set. Without it, uploads
  // land in public/uploads and are served as local paths — no config
  // needed for those.
  { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
];

function hostnameMatchesPattern(pattern: string, hostname: string): boolean {
  if (pattern.startsWith("**.")) {
    const suffix = pattern.slice(2); // "**.example.com" -> ".example.com"
    // Requires at least one label before the suffix — mirrors Next's own
    // "**." wildcard, which matches subdomains, not the bare root domain.
    return hostname.length > suffix.length && hostname.endsWith(suffix);
  }
  return hostname === pattern;
}

/**
 * The client's legacy CMS serves photos through a resizing endpoint —
 * `/Content/ImageUrl?...&width=W&height=0` redirects to a version of the
 * photo cropped/scaled to `W` pixels wide. An import brought in several
 * commercial-listing rows whose `width` was `0`, which that endpoint treats
 * as "no resizing" and serves the original, camera-resolution file — one was
 * 17MB. next/image has to download the source in full before it can produce
 * a thumbnail, so a single such photo made that one listing's page take 7+
 * seconds to load, and in practice fail to load at all. Capping the width
 * here means the client's own server does the resizing, the same way it
 * already does correctly for every row whose width wasn't 0.
 */
const BOFAST_LEGACY_IMAGE_HOST = "www.bofast.se";
const BOFAST_LEGACY_IMAGE_PATH = "/Content/ImageUrl";
const BOFAST_LEGACY_IMAGE_MAX_WIDTH = 1600;

/**
 * Rewrites a known "give me the uncapped original" pattern to a sane width.
 * Any other URL — including a bofast.se one that already specifies a width
 * — is returned unchanged.
 */
export function normalizeImageSrc(src: string): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (
    url.hostname !== BOFAST_LEGACY_IMAGE_HOST ||
    url.pathname !== BOFAST_LEGACY_IMAGE_PATH
  ) {
    return src;
  }

  const width = url.searchParams.get("width");
  if (width !== null && width !== "0") return src;

  url.searchParams.set("width", String(BOFAST_LEGACY_IMAGE_MAX_WIDTH));
  return url.toString();
}

/** True if next/image (per the config above) is allowed to fetch this host. */
export function isAllowedImageHost(hostname: string): boolean {
  return IMAGE_REMOTE_PATTERNS.some((pattern) =>
    hostnameMatchesPattern(pattern.hostname, hostname)
  );
}

/**
 * True if next/image can safely render this src: a same-origin local path
 * (uploads, the placeholder svg), or an https URL on an allow-listed host.
 * Anything else — a disallowed host, http, a malformed URL — is not safe to
 * hand to next/image, which throws rather than degrading gracefully.
 */
export function isRenderableImageSrc(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && isAllowedImageHost(url.hostname);
  } catch {
    return false;
  }
}
