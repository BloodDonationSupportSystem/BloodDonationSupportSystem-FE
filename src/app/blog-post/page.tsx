"use client";
import BlogPostList from "../../components/BlogPostList";
import Pagination from "../../components/Pagination";
import { useBlogPosts } from "../../hooks/useBlogPosts";

export default function BlogPostPage() {
  const {
    data,
    loading,
    error,
    pageNumber,
    pageSize,
    setPageSize,
    goToPage,
  } = useBlogPosts();

  return (
    <div>
      <h1 className="text-center" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 36, marginBottom: 24 }}>Blog Posts</h1>
      {loading && <div className="text-center" style={{ color: 'var(--primary)' }}>Loading...</div>}
      {error && <div className="text-center" style={{ color: 'var(--primary)', fontWeight: 600 }}>{error}</div>}
      {data && (
        <>
          <BlogPostList posts={data.data} />
          <Pagination
            pageNumber={data.pageNumber}
            totalPages={data.totalPages}
            hasPreviousPage={data.hasPreviousPage}
            hasNextPage={data.hasNextPage}
            onPageChange={goToPage}
          />
          <div className="mt-3 text-center">
            <label style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Page Size:
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{ marginLeft: 8, borderRadius: 8, border: '1px solid var(--primary)', padding: '4px 12px', fontWeight: 600 }}
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  );
} 