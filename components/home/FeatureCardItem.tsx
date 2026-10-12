import Image from "next/image";
import Button from "@/components/ui/Button";
import type { FeatureCard } from "@/lib/types";

/** One of the three bottom feature cards (image, title, blurb, CTA). */
export default function FeatureCardItem({ card }: { card: FeatureCard }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-line bg-white shadow-sm">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg text-ink">{card.title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted">{card.description}</p>
        {card.cta && (
          <div className="mt-4 flex justify-end">
            <Button href={card.href}>{card.cta}</Button>
          </div>
        )}
      </div>
    </article>
  );
}
