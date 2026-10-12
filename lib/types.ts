/** Shared domain types used across components and mock data. */

import type { ListingDocument, SpecKey } from "@/lib/listings/spec-sections";
import type { PurchasePackage } from "@/lib/build/types";

export interface NavItem {
  label: string;
  href: string;
  /** Optional dropdown children rendered on hover/click in the navbar. */
  children?: NavItem[];
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  href: string;
  cta?: string;
}

export interface ActionLink {
  id: string;
  icon: "search" | "user" | "wrench";
  title: string;
  description: string;
  href: string;
  cta: string;
}

export interface NewsPost {
  id: string;
  date: string; // ISO date, e.g. "2025-10-17"
  title: string;
  excerpt: string;
  image: string;
  href: string;
  /** Marks the large highlighted post shown on the left of the news block. */
  featured?: boolean;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  cta?: string;
}

export interface Apartment {
  id: string;
  city: string;
  /** Bildgalleri – första bilden är huvudbilden och visas alltid först. */
  images: string[];
  area: number;

  // Lägenhet spefica fält
  rooms?: number;
  rent?: number;
  available?: string;
  floor?: number;
  floorsTotal?: number;
  elevator?: boolean;
  buildYear?: number;
  /** Kommande visningstider, visas som en egen tabell på produktsidan. */
  viewings?: Viewing[];

  // Komerciellt/lokaler specifika fält
  areaMax?: number;
  description?: string;
  contacts?: ListingContact[];

  /** Bekvämligheter, t.ex. "Balkong", "Husdjur tillåtna". Visas på produktsidan. */
  amenities?: string[];

  // Mått, visas som en rad under rubriken på produktsidan.
  loftArea?: number;
  length?: number;
  width?: number;
  height?: number;
  bedrooms?: number;

  /** PDF:er i sidpanelen "Dokument". */
  documents: ListingDocument[];
  /** Teknisk specifikation + Installation & montering, en array per sektion. */
  specs: Record<SpecKey, string[]>;
  /** Köpalternativ i köprutan på produktsidan. */
  packages: PurchasePackage[];
}

/** A single upcoming viewing slot, shown in the "Visningstider" table. */
export interface Viewing {
  /** e.g. "Sön 9 aug" */
  date: string;
  /** e.g. "15:10–15:40" */
  time: string;
}


export interface ListingContact {
  name: string;
  phone: string;
}

/** One question/answer pair in the "Bra att veta" FAQ. */
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

/** Practical information card shown on "Bra att veta". */
export interface InfoCard {
  id: string;
  icon: "wrench" | "mail" | "phone" | "check" | "shield" | "lock";
  title: string;
  description: string;
  href?: string;
  cta?: string;
}

/** A single number highlighted in the "Om oss" key figures row. */
export interface Stat {
  value: string;
  label: string;
}

export interface ValueCard {
  id: string;
  title: string;
  description: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}