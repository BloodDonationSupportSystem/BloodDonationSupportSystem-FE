import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface BlogPost {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  authorId: string;
  authorName: string;
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

export interface BlogPostResponse {
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
  data: BlogPost;
  count: number;
}

export interface BlogPostsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  authorId?: string;
  isPublished?: boolean;
  searchTerm?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  updatedDateFrom?: string;
  updatedDateTo?: string;
  sortBy?: string;
  sortAscending?: boolean;
}

export interface CreateBlogPostRequest {
  title: string;
  body: string;
  isPublished: boolean;
  authorId: string;
}

export interface UpdateBlogPostRequest {
  title: string;
  body: string;
  isPublished: boolean;
}

/**
 * Fetches paginated blog posts with optional filters
 */
export const getBlogPosts = async (params: BlogPostsQueryParams = {}): Promise<PaginatedBlogPostsResponse> => {
  try {
    const defaultParams = {
      PageNumber: 1,
      PageSize: 10,
      SortBy: 'createdTime',
      SortAscending: false
    };

    const requestParams = {
      ...defaultParams,
      PageNumber: params.pageNumber || defaultParams.PageNumber,
      PageSize: params.pageSize || defaultParams.PageSize,
      SortBy: params.sortBy || defaultParams.SortBy,
      SortAscending: params.sortAscending !== undefined ? params.sortAscending : defaultParams.SortAscending,
      ...(params.authorId && { AuthorId: params.authorId }),
      ...(params.isPublished !== undefined && { IsPublished: params.isPublished }),
      ...(params.searchTerm && { SearchTerm: params.searchTerm }),
      ...(params.createdDateFrom && { CreatedDateFrom: params.createdDateFrom }),
      ...(params.createdDateTo && { CreatedDateTo: params.createdDateTo }),
      ...(params.updatedDateFrom && { UpdatedDateFrom: params.updatedDateFrom }),
      ...(params.updatedDateTo && { UpdatedDateTo: params.updatedDateTo }),
    };

    console.log('Fetching blog posts with params:', requestParams);
    const response = await apiClient.get<PaginatedBlogPostsResponse>('/BlogPosts', {
      params: requestParams
    });
    console.log('Blog posts API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as PaginatedBlogPostsResponse;
    }
    throw new Error("Failed to fetch blog posts");
  }
};

/**
 * Fetches a single blog post by ID
 */
export const getBlogPostById = async (id: string): Promise<BlogPostResponse> => {
  try {
    const response = await apiClient.get<BlogPostResponse>(`/BlogPosts/${id}`);
    console.log('Blog post detail response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as BlogPostResponse;
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

/**
 * Creates a new blog post
 */
export const createBlogPost = async (blogPost: CreateBlogPostRequest): Promise<BlogPostResponse> => {
  try {
    const response = await apiClient.post<BlogPostResponse>('/BlogPosts', blogPost);
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as BlogPostResponse;
    }
    throw new Error('Failed to create blog post');
  }
};

/**
 * Updates an existing blog post
 */
export const updateBlogPost = async (id: string, blogPost: UpdateBlogPostRequest): Promise<BlogPostResponse> => {
  try {
    const response = await apiClient.put<BlogPostResponse>(`/BlogPosts/${id}`, blogPost);
    return response.data;
  } catch (error) {
    console.error('Error updating blog post:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as BlogPostResponse;
    }
    throw new Error(`Failed to update blog post with ID: ${id}`);
  }
};

/**
 * Deletes a blog post
 */
export const deleteBlogPost = async (id: string): Promise<BlogPostResponse> => {
  try {
    const response = await apiClient.delete<BlogPostResponse>(`/BlogPosts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as BlogPostResponse;
    }
    throw new Error(`Failed to delete blog post with ID: ${id}`);
  }
}; 