import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Apartment } from "@/lib/types";
import { formatRent } from "@/lib/format";

function floorText(apartment: Apartment): string | null {
  if (apartment.floor == null) return null;
  const total = apartment.floorsTotal != null ? ` av ${apartment.floorsTotal}` : "";
  const lift =
    apartment.elevator == null ? "" : apartment.elevator ? ", hiss finns" : ", hiss saknas";
  return `${apartment.floor}${total}${lift}`;
}

/**
 * "Om bostaden" fact table for the apartment product page: a handful of
 * icon-prefixed rows always visible, plus a "Se alla detaljer" disclosure
 * (native <details>, same accordion mechanism as the Bra att veta FAQ) for
 * the rest.
 */
export default function ApartmentDetailsTable({
  apartment,
  typeLabel = "Attefallshus",
}: {
  apartment: Apartment;
  typeLabel?: string;
}) {
  const rent = formatRent(apartment.rent);
  const floor = floorText(apartment);
  const rentPerSqm =
    apartment.rent && apartment.area
      ? `${Math.round(apartment.rent / apartment.area)} kr/m²/mån`
      : null;

  return (
    <div>
      <h2 className="text-2xl text-brand">Om bostaden</h2>

      <table className="mt-3 w-full text-base">
        <tbody className="divide-y divide-line">
          <tr>
            <th scope="row" className="w-1/2 py-4 pr-2 text-left align-middle font-normal text-ink">
              <span className="flex items-center gap-3">
                <Icon name="home" size={22} className="shrink-0 text-brand" />
                Bostadstyp
              </span>
            </th>
            <td className="py-4 text-right align-middle font-medium text-ink">{typeLabel}</td>
          </tr>

          {apartment.rooms != null && (
            <tr>
              <th scope="row" className="py-4 pr-2 text-left align-middle font-normal text-ink">
                <span className="flex items-center gap-3">
                  <Icon name="floorplan" size={22} className="shrink-0 text-brand" />
                  Antal rum
                </span>
              </th>
              <td className="py-4 text-right align-middle font-medium text-ink">
                {apartment.rooms} rum
              </td>
            </tr>
          )}

          <tr>
            <th scope="row" className="py-4 pr-2 text-left align-middle font-normal text-ink">
              <span className="flex items-center gap-3">
                <Icon name="area" size={22} className="shrink-0 text-brand" />
                Boarea
              </span>
            </th>
            <td className="py-4 text-right align-middle font-medium text-ink">
              {apartment.area} m²
            </td>
          </tr>

          {floor && (
            <tr>
              <th scope="row" className="py-4 pr-2 text-left align-middle font-normal text-ink">
                <span className="flex items-center gap-3">
                  <Icon name="stairs" size={22} className="shrink-0 text-brand" />
                  Våning
                </span>
              </th>
              <td className="py-4 text-right align-middle font-medium text-ink">{floor}</td>
            </tr>
          )}

          {rent && (
            <tr>
              <th scope="row" className="py-4 pr-2 text-left align-middle font-normal text-ink">
                <span className="flex items-center gap-3">
                  <Icon name="receipt" size={22} className="shrink-0 text-brand" />
                  Hyra
                </span>
              </th>
              <td className="py-4 text-right align-middle font-medium text-ink">{rent}</td>
            </tr>
          )}
        </tbody>
      </table>

      <details className="group mt-4 rounded-md border border-brand/50">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-base text-brand [&::-webkit-details-marker]:hidden">
          Se alla detaljer
          <Icon
            name="chevron-down"
            size={16}
            className="shrink-0 transition-transform group-open:rotate-180"
          />
        </summary>

        <table className="w-full border-t border-brand/20 text-base">
          <tbody className="divide-y divide-line">
            {apartment.buildYear != null && (
              <tr>
                <td className="py-4 pl-4 text-ink">Byggår</td>
                <td className="py-4 pr-4 text-right font-medium text-ink">
                  {apartment.buildYear}
                </td>
              </tr>
            )}

            <tr>
              <td className="py-4 pl-4 align-top text-ink">Hyresvärd</td>
              <td className="py-4 pr-4 text-right font-medium text-ink">
                BOFAST AB
                <br />
                <Link
                  href="/om-oss"
                  className="font-normal text-brand underline-offset-2 hover:underline"
                >
                  Om BOFAST
                </Link>
              </td>
            </tr>

            {apartment.available && (
              <tr>
                <td className="py-4 pl-4 text-ink">Tillträde</td>
                <td className="py-4 pr-4 text-right font-medium text-ink">
                  {apartment.available}
                </td>
              </tr>
            )}

            {rentPerSqm && (
              <tr>
                <td className="py-4 pl-4 text-ink">Hyra/m²</td>
                <td className="py-4 pr-4 text-right font-medium text-ink">{rentPerSqm}</td>
              </tr>
            )}
          </tbody>
        </table>
      </details>
    </div>
  );
}
