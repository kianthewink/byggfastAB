/** Shared Tailwind classes for admin form controls. */
export const inputClass =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-accent";
export const labelClass = "flex flex-col gap-1 text-xs font-medium text-panel-muted";
export const sectionTitleClass =
  "mb-2 text-xs font-semibold uppercase tracking-wide text-panel-muted";

/** Short random id for items created in the admin UI. */
export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
