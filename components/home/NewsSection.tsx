import Container from "@/components/ui/Container";
import FeaturedNewsCard from "@/components/news/FeaturedNewsCard";
import NewsListItem from "@/components/news/NewsListItem";
import { news } from "@/data/news";

/** Home news block: one featured post beside a scrollable list of recent posts. */
export default function NewsSection() {
  const featured = news.find((p) => p.featured) ?? news[0];
  const rest = news.filter((p) => p.id !== featured.id);

  return (
    <section className="py-6">
      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          <FeaturedNewsCard post={featured} />
          <div className="rounded-md border border-line bg-white shadow-sm">
            {rest.map((post) => (
              <NewsListItem key={post.id} post={post} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
