import type { BlogPost } from "../types/blog";
import BlogPostItem from "./BlogPostItem";

interface BlogPostListProps {
  posts: BlogPost[];
}

export default function BlogPostList({ posts }: BlogPostListProps) {
  if (!posts.length) return <div className="text-center" style={{ color: 'var(--primary)', fontWeight: 600 }}>No blog posts found.</div>;
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 32 }}>
      {posts.map((post) => (
        <BlogPostItem key={post.id} post={post} />
      ))}
    </div>
  );
}