import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  publishDate: string;
  author: string;
  authorId: string;
  tags: string[];
  slug: string;
  viewCount: number;
  createdTime: string;
  lastUpdatedTime: string;
}

export interface PaginatedBlogPostsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: BlogPost[];
  count: number;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Fetches paginated blog posts
 */
export const getBlogPosts = async (pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedBlogPostsResponse> => {
  try {
    const response = await apiClient.get<PaginatedBlogPostsResponse>('/blogPosts', {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as PaginatedBlogPostsResponse;
    }
    throw new Error("Failed to fetch blog posts");
  }
};

/**
 * Fetches a single blog post by ID
 */
export const getBlogPostById = async (id: string): Promise<PaginatedBlogPostsResponse> => {
  try {
    const response = await apiClient.get<PaginatedBlogPostsResponse>(`/blogPosts/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as PaginatedBlogPostsResponse;
    }
    throw new Error(`Failed to fetch blog post with ID: ${id}`);
  }
};

/**
 * Fetches a single blog post by slug
 */
export const getBlogPostBySlug = async (slug: string): Promise<PaginatedBlogPostsResponse> => {
  try {
    const response = await apiClient.get<PaginatedBlogPostsResponse>(`/blogPosts/slug/${slug}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as PaginatedBlogPostsResponse;
    }
    throw new Error(`Failed to fetch blog post with slug: ${slug}`);
  }
}; 