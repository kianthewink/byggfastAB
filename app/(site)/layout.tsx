import { Suspense } from "react";
import "../site.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareProvider from "@/components/compare/CompareProvider";
import CompareBar from "@/components/compare/CompareBar";
import AccountMenu, {
  AccountMenuFallback,
} from "@/components/account/AccountMenu";

/** Public site chrome. site.css is imported here so its BOFAST design tokens
 *  only load on public routes, never in the admin panel. */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CompareProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar
          accountSlot={
            // Suspense keeps the session lookup off the critical path: the rest
            // of the chrome and the page stream while the cookie is resolved.
            <Suspense fallback={<AccountMenuFallback />}>
              <AccountMenu />
            </Suspense>
          }
        />
        <main className="flex-1">{children}</main>
        <Footer />
        <CompareBar />
      </div>
    </CompareProvider>
  );
}
