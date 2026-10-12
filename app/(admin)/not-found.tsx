import AdminNotFoundContent from "@/components/admin/AdminNotFoundContent";

/**
 * Rendered when notFound() is thrown from within an admin page — e.g. an
 * admin action for a listing/application that no longer exists. Not (yet)
 * reachable for a raw mistyped URL under /administrator; that always
 * resolves through the root app/not-found.tsx instead (see the comment
 * there), which handles it with the same admin-styled content.
 */
export default function AdminNotFound() {
  return <AdminNotFoundContent />;
}
