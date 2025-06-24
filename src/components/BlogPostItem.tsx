import type { BlogPost } from "../types/blog";
import Link from "next/link";

interface BlogPostItemProps {
  post: BlogPost;
}

export default function BlogPostItem({ post }: BlogPostItemProps) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative' }}>
      <span style={{ fontSize: 36, color: 'var(--primary)', marginRight: 8, flexShrink: 0 }} aria-label="Blood Drop" role="img">🩸</span>
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: 'var(--primary)', fontWeight: 700 }}>
          <Link href={`/blog-post/${post.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            {post.title}
          </Link>
        </h2>
        <p style={{ margin: '8px 0 0 0', fontWeight: 500, color: 'var(--foreground)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Author:</span> {post.authorName}
        </p>
        <p style={{ margin: '8px 0', color: 'var(--foreground)', fontSize: 16 }}>{post.body}</p>
        <span className={`badge ${post.isPublished ? 'badge-published' : 'badge-draft'}`}>
          {post.isPublished ? 'Published' : 'Draft'}
        </span>
      </div>
    </div>
  );
} 