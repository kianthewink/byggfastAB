import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { InfoCard } from "@/lib/types";

/** Informationskort med ikon, används i rutnätet på "Bra att veta". */
export default function InfoCardItem({ card }: { card: InfoCard }) {
  return (
    <article className="flex flex-col rounded-md border border-line bg-white p-6 shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-md bg-surface-2 text-brand">
        <Icon name={card.icon} size={20} />
      </span>
      <h3 className="mt-4 text-lg text-brand">{card.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink">
        {card.description}
      </p>
      {card.href && (
        <Link
          href={card.href}
          className="mt-4 text-sm text-brand underline-offset-2 hover:underline"
        >
          {card.cta ?? "Läs mer..."}
        </Link>
      )}
    </article>
  );
}
