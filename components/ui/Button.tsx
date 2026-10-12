import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "pill" | "ghost";

const variants: Record<Variant, string> = {
  // Light lavender pill used for the "Läs mer..." calls to action.
  pill: "bg-surface-2 text-ink shadow-sm hover:bg-brand hover:text-white",
  ghost: "bg-white/20 text-white ring-1 ring-white/60 hover:bg-white/30",
};

/**
 * A link styled as a button. Renders a next/link so navigation stays client-side.
 */
export default function Button({
  href,
  children,
  variant = "pill",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md px-6 py-2 text-sm transition-colors ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
