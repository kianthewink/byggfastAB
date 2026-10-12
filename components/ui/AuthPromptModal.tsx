"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

/**
 * Shown instead of silently redirecting when a signed-out visitor tries to
 * save a listing or anmäl intresse. A teleport to the login page loses
 * context and reads as a bug ("why did clicking the heart send me away?");
 * this explains what's needed and lets them choose, without leaving the
 * listing they were looking at.
 */
export default function AuthPromptModal({
  open,
  onClose,
  next,
  message,
}: {
  open: boolean;
  onClose: () => void;
  /** Current path, so "Logga in" returns here afterwards. */
  next: string;
  /** Why they're being asked — differs for saving vs. anmäl intresse. */
  message: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-md bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="auth-prompt-title" className="text-lg text-brand">
            Logga in för att fortsätta
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Stäng"
            className="shrink-0 text-muted transition-colors hover:text-brand"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-ink">{message}</p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/mina-sidor?next=${encodeURIComponent(next)}`}
            className="rounded-md bg-brand px-4 py-2 text-center text-sm text-white transition-colors hover:bg-brand-dark"
          >
            Logga in
          </Link>
          <Link
            href="/mina-sidor/registrera"
            className="rounded-md border border-brand px-4 py-2 text-center text-sm text-brand transition-colors hover:bg-surface-2"
          >
            Skapa konto
          </Link>
        </div>
      </div>
    </div>
  );
}
