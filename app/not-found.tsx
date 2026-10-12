import "./site.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NotFoundContent from "@/components/layout/NotFoundContent";

/**
 * Handles URLs that match no route at all. A not-found file inside a route
 * group only covers notFound() thrown within that group (see
 * app/(site)/not-found.tsx and app/(admin)/not-found.tsx), never a
 * genuinely unmatched path — Next always resolves those through this root
 * file, so it has to bring the site chrome and stylesheet itself.
 *
 * This used to also read a proxy-set header to render admin-styled chrome
 * for a mistyped /administrator URL, which is the more correct UX — but
 * doing that meant statically importing both site.css and admin.css here,
 * and because this file is reachable from literally every route, Next then
 * preloaded BOTH stylesheets as a "might need this" hint on every single
 * page — including admin.css on the public site, which it had never done
 * before. That's a real regression (a new "preloaded but not used" warning
 * on every public page) traded for a rare, low-stakes cosmetic fix (wrong
 * navbar on a typo'd admin URL), so it was reverted. If that UX ever needs
 * fixing for real, look at the experimental `global-not-found.js`
 * convention instead — it bypasses this file's module graph entirely,
 * rather than trying to make one shared not-found page serve both audiences.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </div>
  );
}
