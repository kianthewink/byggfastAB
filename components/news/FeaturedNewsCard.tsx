import Image from "next/image";
import Link from "next/link";
import type { NewsPost } from "@/lib/types";

/** Large highlighted news post shown on the left of the news block. */
export default function FeaturedNewsCard({ post }: { post: NewsPost }) {
  return (
    <Link
      href={post.href}
      className="group block overflow-hidden rounded-md border border-line bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <time className="text-xs text-muted">{post.date}</time>
        <h3 className="mt-1 text-lg text-brand group-hover:underline">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-ink">{post.excerpt}</p>
      </div>
    </Link>
  );
}
