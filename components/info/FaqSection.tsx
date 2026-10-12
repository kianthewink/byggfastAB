import Icon from "@/components/ui/Icon";
import type { FaqCategory } from "@/lib/types";

/**
 * En FAQ-kategori med utfällbara frågor. Bygger på <details>/<summary> så att
 * innehållet fungerar även utan JavaScript.
 */
export default function FaqSection({ category }: { category: FaqCategory }) {
  return (
    <section aria-labelledby={`faq-${category.id}`}>
      <h3
        id={`faq-${category.id}`}
        className="text-sm tracking-wide text-muted label-caps"
      >
        {category.title}
      </h3>
      <div className="mt-2 divide-y divide-line border-t border-line">
        {category.items.map((item) => (
          <details key={item.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
              {item.question}
              <Icon
                name="chevron-down"
                size={16}
                className="shrink-0 text-brand transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="pb-4 pr-10 text-sm leading-relaxed text-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
