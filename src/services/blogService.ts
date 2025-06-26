import { PaginatedBlogPostsResponse } from "@/types/blog";
import apiClient from "./api/apiConfig";

export async function fetchBlogPosts(pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedBlogPostsResponse> {
  try {
    const response = await apiClient.get(`/blogPosts`, {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize
      }
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch blog posts");
  }
} 