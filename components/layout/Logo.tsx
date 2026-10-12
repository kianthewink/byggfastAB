import Link from "next/link";
import { site } from "@/data/site";

/** BOFAST wordmark + house glyph. Replace the SVG with a real logo asset later. */
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="BOFAST home">
      <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="6" fill="#22548f" />
        <path d="M24 10 40 24h-5v14H13V24H8L24 10z" fill="#ffffff" />
        <path d="M24 10 40 24h-5l-11-9-11 9H8L24 10z" fill="#e2853b" />
      </svg>
      <span className="leading-none">
        <span className="block text-xl font-bold tracking-wide text-brand">
          {site.name}
        </span>
        <span className="block text-[9px] tracking-[0.2em] text-muted label-caps">
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}
