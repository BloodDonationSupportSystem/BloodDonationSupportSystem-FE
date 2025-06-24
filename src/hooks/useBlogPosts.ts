import { useCallback, useEffect, useState } from "react";
import { fetchBlogPosts } from "@/services/blogService";
import { BlogPost , PaginatedBlogPostsResponse} from "@/types/blog";
export function useBlogPosts(initialPage: number = 1, initialPageSize: number = 10) {
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [data, setData] = useState<PaginatedBlogPostsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBlogPosts(pageNumber, pageSize);
      setData(response);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = (page: number) => setPageNumber(page);
  const nextPage = () => data && data.hasNextPage && setPageNumber((p) => p + 1);
  const prevPage = () => data && data.hasPreviousPage && setPageNumber((p) => p - 1);

  return {
    data,
    loading,
    error,
    pageNumber,
    pageSize,
    setPageSize,
    goToPage,
    nextPage,
    prevPage,
  };
} 