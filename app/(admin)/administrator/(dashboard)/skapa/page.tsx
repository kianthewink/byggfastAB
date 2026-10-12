import { verifySession } from "@/lib/auth/dal";
import { getStorageWarning } from "@/lib/storage";
import { CreateBoard } from "./CreateBoard";
import { getBuildSettings } from "@/lib/build/settings";

export const metadata = {
  title: "Skapa annons — Adminpanel",
};

export default async function CreatePage() {
  await verifySession();
  const { municipalities } = await getBuildSettings();
  return (
    <CreateBoard
      storageNote={getStorageWarning()}
      municipalities={municipalities}
    />
  );
}
