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
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <h1>Blog Posts</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
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
          <div style={{ marginTop: 16 }}>
            <label>
              Page Size:
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{ marginLeft: 8 }}
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