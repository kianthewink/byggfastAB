import type { FeatureCard } from "@/lib/types";

/** The three feature cards at the bottom of the home page. */
export const features: FeatureCard[] = [
  {
    id: "garvaren",
    title: "Garvaren",
    description:
      "Fastighetsbolaget Garvaren är ett bolag som säljer attefallshus med källare i kvarteret Garvaren i Ljungby.",
    image: "https://picsum.photos/seed/bofast-garvaren/600/380",
    href: "/attefallshus-med-kallare",
    cta: "Läs mer...",
  },
  {
    id: "flytta-till-bofast",
    title: "Flytta till BOFAST",
    description:
      "Bofast är ett privatägt fastighetsbolag som säljer attefallshus i 30-tal orter i västra Sverige. Vi erbjuder attefallshus i skiftande miljöer, både lantligt och i större tätorter.",
    image: "https://picsum.photos/seed/bofast-field/600/380",
    href: "/attefallshus",
    cta: "Läs mer...",
  },
  {
    id: "golfattefallshus",
    title: "Golfattefallshus",
    description:
      "Möblerat attefallshus om 5 rum och kök med tillhörande inbyggd altan, för 8 personer med självhushåll.",
    image: "https://picsum.photos/seed/bofast-golf/600/380",
    href: "/attefallshus/golf",
    cta: "Läs mer...",
  },
];
