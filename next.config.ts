import type { NextConfig } from "next";
import { IMAGE_REMOTE_PATTERNS } from "./lib/image-hosts";

const nextConfig: NextConfig = {
  // There are stray package-lock.json files in parent folders, so Turbopack
  // would otherwise infer the wrong workspace root. Pin it to this project.
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      // Next's own default is 1MB, well under the 8MB image cap enforced in
      // lib/actions/upload.ts — real photos routinely exceed 1MB, which
      // silently failed every upload with "Body exceeded 1 MB limit."
      // Set above the app limit to leave room for multipart overhead.
      bodySizeLimit: "10mb",
    },
    // Turbopack's persistent dev cache (on by default since 16.1) writes
    // continuously into .next while the dev server runs. On this setup that
    // self-triggers Fast Refresh — the cache write is picked up as a source
    // change, which recompiles, which writes the cache again, forever (seen
    // as the whole app reloading nonstop). Disabling it trades away
    // faster-restart cache reuse, which dev doesn't need anyway.
    turbopackFileSystemCacheForDev: false,
  },
  // The admin panel moved from /admin to /administrator and its sub-pages
  // are now Swedish. These keep old bookmarks working; the catch-all last so
  // the named routes win. Redirects are evaluated before the filesystem, so
  // nothing here can shadow a real page.
  redirects() {
    return [
      { source: "/admin", destination: "/administrator", permanent: false },
      {
        source: "/admin/login",
        destination: "/administrator/logga-in",
        permanent: false,
      },
      {
        source: "/admin/content",
        destination: "/administrator/innehall",
        permanent: false,
      },
      {
        source: "/admin/create",
        destination: "/administrator/skapa",
        permanent: false,
      },
      {
        source: "/admin/import",
        destination: "/administrator/importera",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/administrator/:path*",
        permanent: false,
      },
      // BOFAST now sells attefallshus instead of renting apartments/premises —
      // these keep old bookmarks and search results working under the new
      // names.
      {
        source: "/lediga-lagenheter",
        destination: "/attefallshus",
        permanent: false,
      },
      {
        source: "/lediga-lagenheter/:id",
        destination: "/attefallshus/:id",
        permanent: false,
      },
      {
        source: "/lediga-lokaler",
        destination: "/attefallshus-med-kallare",
        permanent: false,
      },
      {
        source: "/lediga-lokaler/:id",
        destination: "/attefallshus-med-kallare/:id",
        permanent: false,
      },
    ];
  },
  images: {
    // See lib/image-hosts.ts — shared with the runtime check in
    // lib/listings/map.ts so an unreviewed host degrades a photo instead of
    // crashing the page it's on.
    remotePatterns: IMAGE_REMOTE_PATTERNS,
  },
};

export default nextConfig;
