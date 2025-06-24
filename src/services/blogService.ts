import { PaginatedBlogPostsResponse } from "@/types/blog";

export async function fetchBlogPosts(pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedBlogPostsResponse> {
  const res = await fetch(`http://localhost:5222/api/BlogPosts?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  if (!res.ok) {
    throw new Error("Failed to fetch blog posts");
  }
  return res.json();
} 