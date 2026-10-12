import Image from "next/image";
import Link from "next/link";
import type { NewsPost } from "@/lib/types";

/** Compact news row: thumbnail on the left, date + title + excerpt on the right. */
export default function NewsListItem({ post }: { post: NewsPost }) {
  return (
    <Link
      href={post.href}
      className="group flex gap-4 border-b border-line p-4 transition-colors last:border-0 hover:bg-surface-3"
    >
      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <time className="text-xs text-muted">{post.date}</time>
        <h3 className="truncate text-sm font-semibold text-ink group-hover:text-brand">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
      </div>
    </Link>
  );
}
