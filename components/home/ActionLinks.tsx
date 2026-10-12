import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { actionLinks } from "@/data/actionLinks";

/** The three icon shortcuts (search / register / report a fault) below the hero. */
export default function ActionLinks() {
  return (
    <section className="py-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-3">
          {actionLinks.map((link) => (
            <div key={link.id} className="flex flex-col items-center text-center">
              <span className="text-brand">
                <Icon name={link.icon} size={34} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-brand label-caps">
                {link.title}
              </h2>
              <p className="mt-2 max-w-xs text-sm text-ink">{link.description}</p>
              <Button href={link.href} className="mt-4">
                {link.cta}
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
