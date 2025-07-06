import { useState } from 'react';
import {
    blogService,
    BlogPost,
    BlogPostsQueryParams,
    CreateBlogPostRequest,
    UpdateBlogPostRequest
} from '@/services/api';
import { message } from 'antd';

interface UseAdminBlogPostsResult {
    blogPosts: BlogPost[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    pageSize: number;
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    fetchBlogPosts: (params?: BlogPostsQueryParams) => Promise<void>;
    createBlogPost: (post: CreateBlogPostRequest) => Promise<boolean>;
    updateBlogPost: (id: string, post: UpdateBlogPostRequest) => Promise<boolean>;
    deleteBlogPost: (id: string) => Promise<boolean>;
    getBlogPostById: (id: string) => Promise<BlogPost | null>;
}

export function useAdminBlogPosts(): UseAdminBlogPostsResult {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);

    const fetchBlogPosts = async (params: BlogPostsQueryParams = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await blogService.getBlogPosts(params);

            if (response.success) {
                setBlogPosts(response.data);
                setTotalCount(response.totalCount);
                setPageSize(response.pageSize);
                setPageNumber(response.pageNumber);
                setTotalPages(response.totalPages);
                setHasPreviousPage(response.hasPreviousPage);
                setHasNextPage(response.hasNextPage);
            } else {
                setError(response.message || 'Failed to fetch blog posts');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching blog posts');
        } finally {
            setLoading(false);
        }
    };

    const createBlogPost = async (post: CreateBlogPostRequest): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await blogService.createBlogPost(post);

            if (response.success) {
                message.success('Blog post created successfully');
                // Refresh the blog posts list
                await fetchBlogPosts({ pageNumber, pageSize });
                return true;
            } else {
                message.error(response.message || 'Failed to create blog post');
                return false;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while creating the blog post');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateBlogPost = async (id: string, post: UpdateBlogPostRequest): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await blogService.updateBlogPost(id, post);

            if (response.success) {
                message.success('Blog post updated successfully');
                // Refresh the blog posts list
                await fetchBlogPosts({ pageNumber, pageSize });
                return true;
            } else {
                message.error(response.message || 'Failed to update blog post');
                return false;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while updating the blog post');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteBlogPost = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await blogService.deleteBlogPost(id);

            if (response.success) {
                message.success('Blog post deleted successfully');
                // Refresh the blog posts list
                await fetchBlogPosts({ pageNumber, pageSize });
                return true;
            } else {
                message.error(response.message || 'Failed to delete blog post');
                return false;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while deleting the blog post');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
        try {
            setLoading(true);
            const response = await blogService.getBlogPostById(id);

            if (response.success) {
                return response.data;
            } else {
                message.error(response.message || 'Failed to fetch blog post');
                return null;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while fetching the blog post');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        blogPosts,
        loading,
        error,
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        hasPreviousPage,
        hasNextPage,
        fetchBlogPosts,
        createBlogPost,
        updateBlogPost,
        deleteBlogPost,
        getBlogPostById
    };
} 