import { verifySession } from "@/lib/auth/dal";
import { getBuildSettings } from "@/lib/build/settings";
import { BuildSettingsBoard } from "./BuildSettingsBoard";

export const metadata = {
  title: "Bygg online — Adminpanel",
};

export const dynamic = "force-dynamic";

export default async function BuildSettingsPage() {
  await verifySession();
  const settings = await getBuildSettings();
  return <BuildSettingsBoard initial={settings} />;
}
