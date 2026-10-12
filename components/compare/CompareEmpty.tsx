"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { compareHref } from "@/lib/compare";
import { useCompare } from "./CompareProvider";

/**
 * /jamfor without enough houses in the URL. If the visitor's compare list
 * has two or more (e.g. they typed /jamfor directly), go straight to those;
 * otherwise explain how to pick some.
 */
export default function CompareEmpty({ foundIds }: { foundIds: string[] }) {
  const router = useRouter();
  const { items, replace } = useCompare();

  useEffect(() => {
    if (items.length < 2) return;
    const target = compareHref(items.map((i) => i.id));
    if (window.location.pathname + window.location.search !== target) {
      router.replace(target);
    } else if (items.some((i) => !foundIds.includes(i.id))) {
      // Already showing the saved list and some of it no longer exists
      // (removed in the admin panel) — drop those instead of looping.
      replace(items.filter((i) => foundIds.includes(i.id)));
    }
  }, [foundIds, items, replace, router]);

  return (
    <div className="rounded-md border border-line bg-surface-3 p-10 text-center">
      <Icon name="compare" size={32} className="mx-auto text-brand" aria-hidden />
      <h2 className="mt-4 text-lg text-brand">Välj minst två hus att jämföra</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        Klicka på &rdquo;Jämför&rdquo; på husen du är intresserad av — upp till
        fyra stycken. Sedan ser du pris, pris per m³ och alla specifikationer
        sida vid sida.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button href="/attefallshus">Attefallshus</Button>
        <Button href="/attefallshus-med-kallare">Attefallshus med källare</Button>
      </div>
    </div>
  );
}
