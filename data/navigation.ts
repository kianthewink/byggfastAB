import type { NavItem } from "@/lib/types";

/**
 * Primary navigation. Items with `children` render a dropdown in the navbar.
 * Add new pages here and create the matching route folder under /app.
 */
export const mainNav: NavItem[] = [
  { label: "Hem", href: "/" },
  {
    label: "Attefallshus",
    href: "/attefallshus",
    children: [
      { label: "Alla attefallshus", href: "/attefallshus" },
      { label: "Sök på ort", href: "/attefallshus?filter=ort" },
      { label: "Så fungerar kön", href: "/attefallshus/ko" },
    ],
  },
  {
    label: "Attefallshus med källare",
    href: "/attefallshus-med-kallare",
    children: [
      { label: "Alla med källare", href: "/attefallshus-med-kallare" },
      {
        label: "Sök på ort",
        href: "/attefallshus-med-kallare?filter=ort",
      },
    ],
  },
  { label: "Mina sidor", href: "/mina-sidor" },
  { label: "Här finns vi", href: "/har-finns-vi" },
  { label: "Bra att veta", href: "/bra-att-veta" },
  {
    label: "Om oss",
    href: "/om-oss",
    children: [
      { label: "Om BOFAST", href: "/om-oss" },
      { label: "Kontakta oss", href: "/om-oss/kontakt" },
      { label: "Lediga tjänster", href: "/om-oss/jobb" },
    ],
  },
];
