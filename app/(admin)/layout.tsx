import "../admin.css";
import type { Metadata } from "next";
import { InlineScript } from "@/components/admin/InlineScript";

export const metadata: Metadata = {
  title: "Adminpanel",
  description: "Innehållsadministration för BOFAST",
  robots: { index: false, follow: false },
};

/**
 * Admin chrome-less shell: loads admin.css (its own token set, isolated from
 * the public site) and applies the saved light/dark theme before first paint.
 * Auth is enforced one level down, in administrator/(dashboard)/layout.tsx,
 * so that /administrator/logga-in stays reachable.
 */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light")}catch(e){}})()`;

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <InlineScript html={THEME_INIT_SCRIPT} />
      {children}
    </div>
  );
}
