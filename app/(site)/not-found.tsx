import NotFoundContent from "@/components/layout/NotFoundContent";

/** Rendered for notFound() thrown inside a public page — e.g. a listing id
 *  that isn't in the database. The site layout already supplies the chrome. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
