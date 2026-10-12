import Link from "next/link";
import Container from "@/components/ui/Container";

/** Body of the 404 page, shared by the site-group and root not-found files. */
export default function NotFoundContent() {
  return (
    <Container className="py-24 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-4 text-xl text-ink">Sidan kunde inte hittas</h1>
      <p className="mt-2 text-sm text-muted">
        Sidan du letar efter finns inte eller har flyttats.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-surface-2 px-6 py-2 text-sm text-ink transition-colors hover:bg-brand hover:text-white"
      >
        Till startsidan
      </Link>
    </Container>
  );
}
