"use client";

import { useId } from "react";
import Icon from "@/components/ui/Icon";
import { useBuild } from "./BuildProvider";

/** "Välj kommun" — every price on the page follows this choice. */
export default function KommunSelect({ showLabel = false }: { showLabel?: boolean }) {
  const build = useBuild();
  const id = useId();
  if (!build) return null;

  return (
    <div>
      <label
        htmlFor={id}
        className={showLabel ? "mb-1.5 block text-sm text-ink" : "sr-only"}
      >
        Kommun
      </label>
      <div className="relative">
        <select
          id={id}
          value={build.config.municipalityId ?? ""}
          onChange={(e) => build.setMunicipality(e.target.value || null)}
          className="w-full appearance-none rounded-md border border-line bg-white py-2.5 pl-3.5 pr-10 text-sm text-ink outline-none transition-colors focus:border-brand"
        >
          <option value="">Välj kommun</option>
          {build.municipalities.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
      {!build.municipality && (
        <p className="mt-1.5 text-xs text-muted">
          Priset beror på var du ska bygga — välj kommun för ditt pris.
        </p>
      )}
    </div>
  );
}
