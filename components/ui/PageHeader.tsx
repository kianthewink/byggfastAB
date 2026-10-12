import Container from "@/components/ui/Container";

/** Simple heading band used by inner/stub pages. */
export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="py-10">
        <h1 className="text-2xl text-brand md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-ink">{subtitle}</p>}
      </Container>
    </div>
  );
}
