"use client";

import { useOptimistic, useState, useTransition, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import AuthPromptModal from "@/components/ui/AuthPromptModal";
import { toggleSavedListing } from "@/lib/listings/saved-actions";

interface SaveButtonProps {
  listingId: string;
  /** Saved state as of the last server render. */
  initialSaved: boolean;
  /** False for signed-out visitors — the heart then prompts them to log in. */
  authed: boolean;
  /** Positioning and colours are the caller's job; this only sizes the icon. */
  className?: string;
  size?: number;
}

/**
 * The heart that adds a listing to "Sparade objekt".
 *
 * Signed-out visitors used to be redirected straight to Mina sidor, which
 * read as a bug ("why did clicking the heart send me away?"). They now get
 * an explanatory modal with the choice to log in or register instead.
 *
 * State is `useOptimistic` rather than `useState` on purpose: the action
 * revalidates the layout, and useOptimistic snaps back to whatever the server
 * then says instead of holding a guess that a failed write would strand.
 */
export default function SaveButton({
  listingId,
  initialSaved,
  authed,
  className = "",
  size = 18,
}: SaveButtonProps) {
  const pathname = usePathname();
  const [saved, setSaved] = useOptimistic(initialSaved);
  const [pending, startTransition] = useTransition();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Cards wrap the whole tile in a stretched link; without this the click
    // navigates instead of saving.
    event.preventDefault();
    event.stopPropagation();

    if (!authed) {
      setShowAuthPrompt(true);
      return;
    }

    const next = !saved;
    startTransition(async () => {
      setSaved(next);
      const result = await toggleSavedListing(listingId, next);
      // The session could have expired between page load and this click.
      if (!result.ok && result.reason === "unauthenticated") {
        setShowAuthPrompt(true);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={saved ? "Ta bort från sparade" : "Spara objekt"}
        title={
          authed
            ? saved
              ? "Ta bort från sparade"
              : "Spara objekt"
            : "Logga in för att spara"
        }
        className={`disabled:cursor-progress ${className}`}
      >
        <Icon
          name={saved ? "heart-filled" : "heart"}
          size={size}
          className={saved ? "text-brand" : undefined}
        />
      </button>

      <AuthPromptModal
        open={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        next={pathname}
        message="Logga in eller skapa ett konto för att spara attefallshus du är intresserad av."
      />
    </>
  );
}
