import { verifySession } from "@/lib/auth/dal";
import { getListings } from "../innehall/actions";
import { ImportBoard } from "./ImportBoard";

export const metadata = {
  title: "Importera — Adminpanel",
};

export default async function ImportPage() {
  await verifySession();
  const listings = await getListings();
  return <ImportBoard initialListings={listings} />;
}
