import type { HeroSlide } from "@/lib/types";

/**
 * Hero carousel slides. Swap the picsum URLs for real photos in /public,
 * e.g. image: "/hero/villagatan.jpg".
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "welcome",
    image: "https://picsum.photos/seed/bofast-hero1/1600/720",
    title: "Välkommen till BOFAST",
    href: "/om-oss",
    cta: "Läs mer...",
  },
  {
    id: "attefallshus",
    image: "https://picsum.photos/seed/bofast-hero2/1600/720",
    title: "Hitta ditt nya attefallshus",
    href: "/attefallshus",
    cta: "Läs mer...",
  },
  {
    id: "attefallshus-kallare",
    image: "https://picsum.photos/seed/bofast-hero3/1600/720",
    title: "Attefallshus med källare",
    href: "/attefallshus-med-kallare",
    cta: "Läs mer...",
  },
];
