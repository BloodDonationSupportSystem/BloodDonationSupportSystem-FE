import { useCallback, useEffect, useState } from "react";
import * as blogService from "@/services/api/blogService";
import { BlogPost, PaginatedBlogPostsResponse, BlogPostsQueryParams } from "@/services/api/blogService";

export function useBlogPosts(initialParams: BlogPostsQueryParams = {}) {
  const [params, setParams] = useState<BlogPostsQueryParams>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'createdTime',
    sortAscending: false,
    ...initialParams
  });
  const [data, setData] = useState<PaginatedBlogPostsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getBlogPosts(params);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = (newParams: Partial<BlogPostsQueryParams>) => {
    setParams(prev => ({
      ...prev,
      ...newParams,
      // Reset to page 1 when filters change (except when explicitly changing page)
      pageNumber: newParams.pageNumber || 
        (Object.keys(newParams).some(key => key !== 'pageNumber') ? 1 : prev.pageNumber)
    }));
  };

  const goToPage = (page: number) => updateParams({ pageNumber: page });
  const nextPage = () => data?.hasNextPage && goToPage((params.pageNumber || 1) + 1);
  const prevPage = () => data?.hasPreviousPage && goToPage((params.pageNumber || 1) - 1);
  const changePageSize = (size: number) => updateParams({ pageSize: size });

  return {
    data,
    blogPosts: data?.data || [],
    loading,
    error,
    params,
    updateParams,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    refresh: fetchData
  };
} 