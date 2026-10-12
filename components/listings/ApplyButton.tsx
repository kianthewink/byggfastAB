"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import AuthPromptModal from "@/components/ui/AuthPromptModal";
import { useBuild } from "@/components/build/BuildProvider";
import { submitApplicationAction } from "@/lib/listings/application-actions";

interface ApplyButtonProps {
  listingId: string;
  /** Whether the signed-in visitor has already applied, as of last render. */
  initialApplied: boolean;
  /** False for signed-out visitors — the button then prompts them to log in. */
  authed: boolean;
  /** Overrides the button label, e.g. "Skicka intresseanmälan". */
  label?: string;
  className?: string;
}

/**
 * "Anmäl intresse" on a listing's detail page. Records interest in the
 * `applications` table (shown in the admin panel's Ansökningar page) along
 * with the visitor's kommun, package and Bygg online choices when the page
 * has them.
 *
 * Signed-out visitors get the same login/register prompt as the save
 * button, rather than being redirected away from the listing.
 */
export default function ApplyButton({
  listingId,
  initialApplied,
  authed,
  label = "Anmäl intresse",
  className = "",
}: ApplyButtonProps) {
  const pathname = usePathname();
  const build = useBuild();
  // On a product page the applied state lives in BuildProvider so every
  // button agrees; elsewhere this button keeps its own.
  const [localApplied, setLocalApplied] = useState(initialApplied);
  const [localSent, setLocalSent] = useState<string | null>(null);
  const applied = build ? build.applied : localApplied;
  // The choices last sent, so an applied visitor who then changes something
  // is offered to send the update.
  const sentConfig = build ? build.sentConfig : localSent;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const currentConfig = build ? JSON.stringify(build.config) : null;
  // Only known for sends made on this page view; an application from an
  // earlier visit offers a quieter "send my current choices" link instead.
  const changedSinceSent =
    applied && sentConfig !== null && currentConfig !== sentConfig;

  function handleClick() {
    if (!authed) {
      setShowAuthPrompt(true);
      return;
    }
    if (pending) return;

    setError(null);
    startTransition(async () => {
      const result = await submitApplicationAction(listingId, build?.config);
      if (result.ok) {
        if (build) {
          build.markSent(currentConfig ?? "");
        } else {
          setLocalApplied(true);
          setLocalSent(currentConfig);
        }
      } else if (result.reason === "unauthenticated") {
        // The session could have expired between page load and this click.
        setShowAuthPrompt(true);
      } else {
        setError("Kunde inte skicka intresseanmälan. Försök igen.");
      }
    });
  }

  const done = applied && !changedSinceSent;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || done}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm transition-colors ${
          done
            ? "cursor-default bg-surface-2 text-ink"
            : "bg-surface-2 text-ink shadow-sm hover:bg-brand hover:text-white disabled:cursor-progress disabled:opacity-70"
        }`}
      >
        {done && <Icon name="check" size={16} className="text-brand" />}
        {pending
          ? "Skickar…"
          : done
            ? "Intresse anmält"
            : applied
              ? "Uppdatera intresseanmälan"
              : label}
      </button>

      {done && build && sentConfig === null && (
        <button
          type="button"
          onClick={handleClick}
          className="mt-2 text-xs text-brand underline-offset-2 hover:underline"
        >
          Skicka dina nuvarande val
        </button>
      )}
      {done && build && sentConfig !== null && (
        <p className="mt-2 text-xs text-muted">
          Vi har fått dina val. Ändrar du något kan du skicka en uppdatering.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        next={pathname}
        message="Logga in eller skapa ett konto för att anmäla ditt intresse för våra attefallshus."
      />
    </div>
  );
}
