"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readStorage, writeStorage } from "@/lib/browser-storage";
import { MAX_COMPARE } from "@/lib/compare";

const STORAGE_KEY = "bofast-jamfor";

/** Just enough to draw the compare bar; the page itself loads fresh data. */
export interface CompareItem {
  id: string;
  title: string;
  image: string;
}

interface CompareContextValue {
  items: CompareItem[];
  isSelected: (id: string) => boolean;
  /** Adds or removes; returns false when the list is already full. */
  toggle: (item: CompareItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  /** Replaces the whole list, e.g. with what a shared /jamfor link shows. */
  replace: (items: CompareItem[]) => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function useCompare(): CompareContextValue {
  const value = useContext(CompareContext);
  if (!value) throw new Error("useCompare must be used inside CompareProvider");
  return value;
}

function sanitize(value: unknown): CompareItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is CompareItem =>
        !!v && typeof v.id === "string" && typeof v.title === "string" && typeof v.image === "string"
    )
    .slice(0, MAX_COMPARE);
}

/**
 * The visitor's compare list, shared by every "Jämför" toggle, the compare
 * bar and the /jamfor page. Kept in localStorage (no account needed) and
 * kept in step across open tabs.
 */
export default function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    // Restored after mount so the server render and hydration always match.
    const timer = window.setTimeout(() => {
      setItems(sanitize(readStorage(STORAGE_KEY)));
      setRestored(true);
    }, 0);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(sanitize(readStorage(STORAGE_KEY)));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (restored) writeStorage(STORAGE_KEY, items);
  }, [items, restored]);

  const value = useMemo<CompareContextValue>(() => {
    const isSelected = (id: string) => items.some((item) => item.id === id);
    return {
      items,
      isSelected,
      isFull: items.length >= MAX_COMPARE,
      toggle: (item) => {
        if (isSelected(item.id)) {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          return true;
        }
        if (items.length >= MAX_COMPARE) return false;
        setItems((prev) =>
          prev.some((i) => i.id === item.id) ? prev : [...prev, item].slice(0, MAX_COMPARE)
        );
        return true;
      },
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clear: () => setItems([]),
      replace: (next) => setItems(sanitize(next)),
    };
  }, [items]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
