export interface BlogPost {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  authorId: string;
  authorName: string;
  createdTime: string | null;
  lastUpdatedTime: string | null;
}

export interface PaginatedBlogPostsResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: BlogPost[];
  count: number;
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
} 