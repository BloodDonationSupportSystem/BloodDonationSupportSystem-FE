import { notFound } from "next/navigation";

async function getBlogPost(id: string) {
  const res = await fetch(`http://localhost:5222/api/BlogPosts/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function BlogPostDetailPage({ params }: { params: { id: string } }) {
  const post = await getBlogPost(params.id);
  if (!post) return notFound();

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        <span style={{ fontSize: 40, color: 'var(--primary)', marginRight: 8 }} aria-label="Blood Drop" role="img">🩸</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 28, color: 'var(--primary)', fontWeight: 800 }}>{post.title}</h1>
          <p style={{ margin: '12px 0 0 0', fontWeight: 500, color: 'var(--foreground)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Author:</span> {post.authorName}
          </p>
          <p style={{ margin: '16px 0', color: 'var(--foreground)', fontSize: 18 }}>{post.body}</p>
          <span className={`badge ${post.isPublished ? 'badge-published' : 'badge-draft'}`}>
            {post.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
    </div>
  );
} 