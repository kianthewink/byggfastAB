"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import SaveButton from "@/components/listings/SaveButton";

interface ProductGalleryProps {
  images: string[];
  alt: string;
  /** Rendered next to the thumbnail row, e.g. the city heading. */
  titleSlot?: ReactNode;
  /** Id of the listing being shown — drives the save-to-favourites heart. */
  listingId: string;
  /** Whether the signed-in visitor has hearted this listing. */
  saved?: boolean;
  authed?: boolean;
}

/**
 * Large image + thumbnail gallery for a listing's product page. Clicking a
 * thumbnail (or the arrows on the main image) swaps the main image.
 * Double-clicking a thumbnail, or the expand button, opens a fullscreen
 * lightbox to flip through every image. There's no real fullscreen API call
 * here (it tends to be blocked inside sandboxed preview frames) – the
 * "fullscreen view" is a fixed, viewport-covering overlay instead.
 */
export default function ProductGallery({
  images,
  alt,
  titleSlot,
  listingId,
  saved = false,
  authed = false,
}: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const count = images.length;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, goPrev, goNext]);

  return (
    <div>
      {/* Stor bild */}
      <div className="relative aspect-[4/3] w-full max-w-[660px] overflow-hidden rounded-md bg-neutral-100">
        <Image
          src={images[index]}
          alt={alt}
          fill
          sizes="(max-width: 700px) 100vw, 660px"
          priority
          className="object-cover"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Föregående bild"
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm transition-colors hover:bg-white"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Nästa bild"
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm transition-colors hover:bg-white"
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </>
        )}

        <SaveButton
          listingId={listingId}
          initialSaved={saved}
          authed={authed}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm transition-colors hover:bg-white"
        />

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Visa i helskärm"
          className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm transition-colors hover:bg-white"
        >
          <Icon name="expand" size={18} />
        </button>

        {count > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
            {index + 1} / {count}
          </span>
        )}
      </div>

      {/* Imglets + rubrik */}
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <div className="flex gap-3">
          {images.map((src, i) => {
            const selected = i === index;
            return (
              <button
                key={src}
                type="button"
                onClick={() => goTo(i)}
                onDoubleClick={() => {
                  goTo(i);
                  setLightboxOpen(true);
                }}
                aria-label={`Visa bild ${i + 1} av ${count}`}
                aria-current={selected}
                className={`relative size-20 shrink-0 overflow-hidden rounded-md transition-all sm:size-24 ${
                  selected
                    ? "opacity-100 ring-2 ring-brand ring-offset-2"
                    : "opacity-55 brightness-90 hover:opacity-80"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>

        {titleSlot}
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} – helskärmsvisning`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Stäng helskärmsvisning"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <Icon name="close" size={22} />
          </button>

          <div className="relative flex-1">
            <Image
              src={images[index]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Föregående bild"
                  className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
                >
                  <Icon name="chevron-left" size={26} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Nästa bild"
                  className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
                >
                  <Icon name="chevron-right" size={26} />
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <p className="pb-6 text-center text-sm text-white/80">
              {index + 1} / {count}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
