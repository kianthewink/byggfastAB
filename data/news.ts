import type { NewsPost } from "@/lib/types";

/** News feed. The `featured` post renders large on the left of the news block. */
export const news: NewsPost[] = [
  {
    id: "oppettider-sommar",
    date: "2026-06-25",
    title: "Öppettider sommar",
    excerpt:
      "Öppettider v.26 –33 Måndag – Torsdag 07.30 – 12.30 Fredag 08.00 – 12.30",
    image: "https://picsum.photos/seed/bofast-flowers/900/700",
    href: "/nyheter/oppettider-sommar",
    featured: true,
  },
  {
    id: "kop-erik-larsson",
    date: "2025-10-17",
    title: "Bofast AB köper Erik Larsson Bygg Fastigheter",
    excerpt:
      "\"Jag är mycket glad att meddela att vi idag har genomfört förvärvet av Erik Larsson Bygg Fastigheter.\"",
    image: "https://picsum.photos/seed/bofast-house1/400/300",
    href: "/nyheter/kop-erik-larsson",
  },
  {
    id: "energispar-svenljunga",
    date: "2025-10-17",
    title: "Energispar Svenljunga",
    excerpt:
      "Fastigheterna på Rydins väg 7– 13 samt Orrstigen 1– 3, Svenljunga har tagit del av...",
    image: "https://picsum.photos/seed/bofast-eu/400/300",
    href: "/nyheter/energispar-svenljunga",
  },
  {
    id: "saljer-soderport",
    date: "2025-03-19",
    title: "Bofast och CA Fastigheter säljer handelsområdet Söderport",
    excerpt:
      "Bofast och CA Fastigheter säljer handelsområdet Söderport i Värnamo.",
    image: "https://picsum.photos/seed/bofast-aerial/400/300",
    href: "/nyheter/saljer-soderport",
  },
  {
    id: "kop-lagans",
    date: "2024-11-06",
    title: "Bofast AB köper Lagans Fastigheter",
    excerpt:
      "\"Jag är mycket glad att kunna meddela att vi idag har genomfört förvärvet av...\"",
    image: "https://picsum.photos/seed/bofast-house2/400/300",
    href: "/nyheter/kop-lagans",
  },
];
