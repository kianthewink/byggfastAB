"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { heroSlides } from "@/data/heroSlides";
import Icon from "@/components/ui/Icon";

const AUTOPLAY_MS = 6000;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroSlides.length;

  const go = useCallback(
    (next: number) => setIndex((next + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  return (
    <section
      className="relative h-[46vh] min-h-[320px] w-full overflow-hidden bg-brand-dark md:h-[520px]"
      aria-roledescription="carousel"
      aria-label="Bildspel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {heroSlides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
            <h1 className="text-2xl tracking-wide drop-shadow-md md:text-4xl">
              {slide.title}
            </h1>
            {slide.cta && (
              <Link
                href={slide.href}
                className="mt-5 inline-flex items-center rounded-md bg-white/20 px-6 py-2 text-sm ring-1 ring-white/70 backdrop-blur transition-colors hover:bg-white/30"
              >
                {slide.cta}
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Prev / next controls */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Föregående bild"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
      >
        <Icon name="arrow-left" size={20} />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Nästa bild"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
      >
        <Icon name="arrow-right" size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Gå till bild ${i + 1}`}
            aria-current={i === index}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
