import type { Apartment } from "@/lib/types";

const sek = new Intl.NumberFormat("sv-SE");

/** "58 kvm" or, when an area range is given, "200–880 kvm". */
export function formatArea(item: Pick<Apartment, "area" | "areaMax">): string {
  if (item.areaMax) {
    return `${item.area}–${item.areaMax} kvm`;
  }
  return `${item.area} kvm`;
}

/** "8 100 kr/mån", or undefined if no rent is set. */
export function formatRent(rent: number | undefined): string | undefined {
  if (!rent) return undefined;
  return `${sek.format(rent)} kr/mån`;
}

/** Strips spaces/dashes so phone numbers work as tel: links. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

const swedishDate = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
  // Pinned, not left to the host: these dates are rendered on the server, and
  // on a UTC host a registration at 00:30 Swedish time would otherwise be
  // shown as the previous day.
  timeZone: "Europe/Stockholm",
});

/** "11 augusti 2026" */
export function formatDate(value: Date): string {
  return swedishDate.format(value);
}

/**
 * Queue time as "3 dagar", "5 månader" or "2 år 3 månader" — how a Swedish
 * housing queue reports köpoäng. Months are counted as whole calendar months
 * so the number never drifts by a day here and there.
 */
export function formatQueueTime(since: Date, now: Date = new Date()): string {
  const days = Math.max(
    0,
    Math.floor((now.getTime() - since.getTime()) / 86_400_000)
  );

  if (days < 31) {
    return days === 1 ? "1 dag" : `${days} dagar`;
  }

  let months =
    (now.getFullYear() - since.getFullYear()) * 12 +
    (now.getMonth() - since.getMonth());
  if (now.getDate() < since.getDate()) months -= 1;
  months = Math.max(1, months);

  const years = Math.floor(months / 12);
  const restMonths = months % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(years === 1 ? "1 år" : `${years} år`);
  if (restMonths > 0) {
    parts.push(restMonths === 1 ? "1 månad" : `${restMonths} månader`);
  }

  return parts.join(" ");
}
