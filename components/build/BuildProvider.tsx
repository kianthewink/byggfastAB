"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { localPrice, normalizeConfig, quoteBuild } from "@/lib/build/pricing";
import {
  KOMMUN_STORAGE_KEY,
  readStorage,
  writeStorage,
} from "@/lib/browser-storage";
import type {
  BuildCatalog,
  BuildConfig,
  BuildQuote,
  ExactPrices,
  Municipality,
  PurchasePackage,
} from "@/lib/build/types";

interface BuildContextValue {
  listingId: string;
  /** e.g. "Attefallshus i Hyltebruk" — the summary card's heading. */
  title: string;
  image: string;
  catalog: BuildCatalog;
  packages: PurchasePackage[];
  municipalities: Municipality[];
  config: BuildConfig;
  quote: BuildQuote;
  municipality: Municipality | null;
  selectedPackage: PurchasePackage | null;
  /** A base price adjusted for the chosen kommun. */
  priceOf: (base: number, exactPrices: ExactPrices) => number;
  setMunicipality: (id: string | null) => void;
  setPackage: (id: string) => void;
  /** Picks an option (single choice) or toggles it (multiple choice). */
  chooseOption: (categoryId: string, optionId: string) => void;
  /** Whether this visitor has sent an interest application for the product. */
  applied: boolean;
  /** The config last sent on this page view (JSON), to offer "update". */
  sentConfig: string | null;
  markSent: (config: string) => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

/** Null outside a product page — callers degrade to a plain button. */
export function useBuild(): BuildContextValue | null {
  return useContext(BuildContext);
}

const configKey = (listingId: string) => `bofast-bygg:${listingId}`;

/**
 * Owns the visitor's kommun, package and Bygg online choices for one product
 * page, shared by the purchase box, the configurator and every "Anmäl
 * intresse" button. Choices are remembered per product in localStorage, and
 * the kommun across products (you build in one place).
 */
export default function BuildProvider({
  listingId,
  title,
  image,
  catalog,
  packages,
  municipalities,
  initialApplied,
  children,
}: {
  listingId: string;
  title: string;
  image: string;
  catalog: BuildCatalog;
  packages: PurchasePackage[];
  municipalities: Municipality[];
  initialApplied: boolean;
  children: ReactNode;
}) {
  const normalize = useCallback(
    (raw: Partial<BuildConfig> | null) =>
      normalizeConfig(raw, catalog, packages, municipalities),
    [catalog, packages, municipalities]
  );

  // Server render and first client render start from the defaults; saved
  // choices are applied after mount so hydration always matches.
  const [config, setConfig] = useState<BuildConfig>(() => normalize(null));
  const [restored, setRestored] = useState(false);
  // Shared so every "Anmäl intresse" button on the page agrees.
  const [applied, setApplied] = useState(initialApplied);
  const [sentConfig, setSentConfig] = useState<string | null>(null);

  useEffect(() => {
    const saved = readStorage<Partial<BuildConfig>>(configKey(listingId));
    const kommun = readStorage<string>(KOMMUN_STORAGE_KEY);
    // Deferred a tick so the restore isn't a synchronous cascade of renders.
    const timer = window.setTimeout(() => {
      setConfig(
        normalize({ ...saved, municipalityId: saved?.municipalityId ?? kommun })
      );
      setRestored(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [listingId, normalize]);

  useEffect(() => {
    if (!restored) return;
    writeStorage(configKey(listingId), config);
    if (config.municipalityId) writeStorage(KOMMUN_STORAGE_KEY, config.municipalityId);
  }, [config, listingId, restored]);

  const value = useMemo<BuildContextValue>(() => {
    const municipality =
      municipalities.find((m) => m.id === config.municipalityId) ?? null;

    return {
      listingId,
      title,
      image,
      catalog,
      packages,
      municipalities,
      config,
      quote: quoteBuild(config, catalog, packages, municipalities),
      municipality,
      selectedPackage: packages.find((p) => p.id === config.packageId) ?? null,
      priceOf: (base, exactPrices) => localPrice(base, exactPrices, municipality),
      setMunicipality: (id) =>
        setConfig((prev) => ({ ...prev, municipalityId: id })),
      setPackage: (id) => setConfig((prev) => ({ ...prev, packageId: id })),
      chooseOption: (categoryId, optionId) =>
        setConfig((prev) => {
          const category = catalog.groups
            .flatMap((g) => g.categories)
            .find((c) => c.id === categoryId);
          if (!category) return prev;
          const current = prev.selections[categoryId] ?? [];
          const next = category.multiple
            ? current.includes(optionId)
              ? current.filter((id) => id !== optionId)
              : [...current, optionId]
            : [optionId];
          return {
            ...prev,
            selections: { ...prev.selections, [categoryId]: next },
          };
        }),
      applied,
      sentConfig,
      markSent: (sent) => {
        setApplied(true);
        setSentConfig(sent);
      },
    };
  }, [applied, catalog, config, image, listingId, municipalities, packages, sentConfig, title]);

  return <BuildContext.Provider value={value}>{children}</BuildContext.Provider>;
}
