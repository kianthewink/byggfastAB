import { verifySession } from "@/lib/auth/dal";
import { getStorageWarning } from "@/lib/storage";
import { getListings } from "./actions";
import { ContentBoard } from "./ContentBoard";
import { getBuildSettings } from "@/lib/build/settings";

export const metadata = {
  title: "Innehåll — Adminpanel",
};

export default async function ContentPage() {
  await verifySession();
  const [listings, { municipalities }] = await Promise.all([
    getListings(),
    getBuildSettings(),
  ]);
  return (
    <ContentBoard
      initialListings={listings}
      storageNote={getStorageWarning()}
      municipalities={municipalities}
    />
  );
}
