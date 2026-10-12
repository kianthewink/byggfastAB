import type { ActionLink } from "@/lib/types";

/** The three call-to-action shortcuts shown directly under the hero. */
export const actionLinks: ActionLink[] = [
  {
    id: "attefallshus",
    icon: "search",
    title: "Attefallshus",
    description: "Titta på våra attefallshus och hitta ditt nästa hem",
    href: "/attefallshus",
    cta: "Läs mer...",
  },
  {
    id: "registrera",
    icon: "user",
    title: "Registrera dig",
    description: "Registrera dig som sökande eller som hyresgäst",
    href: "/mina-sidor",
    cta: "Läs mer...",
  },
  {
    id: "felanmalan",
    icon: "wrench",
    title: "Felanmälan",
    description: "Här kan du logga in och göra felanmälan på ditt objekt",
    href: "/felanmalan",
    cta: "Läs mer...",
  },
];