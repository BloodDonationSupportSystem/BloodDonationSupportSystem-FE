'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Pagination, Input, Select, DatePicker, Space, Button, Spin, Empty, Tag, Divider } from 'antd';
import { SearchOutlined, CalendarOutlined, SortAscendingOutlined, SortDescendingOutlined, UserOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPostsQueryParams } from '@/services/api/blogService';
import type { Dayjs } from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BlogPage = () => {
  // State for filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [sortBy, setSortBy] = useState<string>('createdTime');
  const [sortDirection, setSortDirection] = useState<boolean>(false); // false = descending

  // Blog posts hook
  const { 
    blogPosts, 
    data, 
    loading, 
    error, 
    params,
    updateParams,
    goToPage,
    changePageSize,
    refresh
  } = useBlogPosts({
    sortBy: 'createdTime',
    sortAscending: false
  });

  // Handle search
  const handleSearch = () => {
    const queryParams: BlogPostsQueryParams = {
      searchTerm: searchTerm || undefined,
      sortBy,
      sortAscending: sortDirection
    };

    // Add date range if set
    if (dateRange && dateRange[0] && dateRange[1]) {
      queryParams.createdDateFrom = dateRange[0].format('YYYY-MM-DDTHH:mm:ss');
      queryParams.createdDateTo = dateRange[1].format('YYYY-MM-DDTHH:mm:ss');
    }

    updateParams(queryParams);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateRange(null);
    setSortBy('createdTime');
    setSortDirection(false);
    updateParams({
      searchTerm: undefined,
      createdDateFrom: undefined,
      createdDateTo: undefined,
      sortBy: 'createdTime',
      sortAscending: false
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Extract plain text from HTML for preview
  const getTextPreview = (html: string, maxLength: number = 150) => {
    // Create a temporary div to parse HTML (client-side only)
    if (typeof document !== 'undefined') {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const text = temp.textContent || temp.innerText || '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    // Fallback for server-side rendering
    return html.replace(/<[^>]*>?/gm, '').substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <Title level={1} className="text-center mb-4">Blog Posts</Title>
        <Paragraph className="text-center text-gray-600 max-w-3xl mx-auto">
          Stay updated with the latest news, stories, and insights about blood donation and our community initiatives.
        </Paragraph>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              onPressEnter={handleSearch}
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters
            </Button>
            <Button
              type={sortDirection ? 'default' : 'primary'}
              icon={<SortDescendingOutlined />}
              onClick={() => {
                setSortDirection(false);
                updateParams({ sortAscending: false });
              }}
            >
              Newest
            </Button>
            <Button
              type={sortDirection ? 'primary' : 'default'}
              icon={<SortAscendingOutlined />}
              onClick={() => {
                setSortDirection(true);
                updateParams({ sortAscending: true });
              }}
            >
              Oldest
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={resetFilters}
            >
              Reset
            </Button>
          </div>
        </div>

        {filterOpen && (
          <div className="pt-4 border-t">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={6}>
                <div className="mb-2">Sort by</div>
                <Select
                  style={{ width: '100%' }}
                  value={sortBy}
                  onChange={(value) => {
                    setSortBy(value);
                    updateParams({ sortBy: value });
                  }}
                >
                  <Option value="createdTime">Created Date</Option>
                  <Option value="lastUpdatedTime">Updated Date</Option>
                  <Option value="title">Title</Option>
                  <Option value="authorName">Author</Option>
                </Select>
              </Col>
              <Col xs={24} md={10}>
                <div className="mb-2">Date Range</div>
                <RangePicker 
                  style={{ width: '100%' }}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                />
              </Col>
              <Col xs={24} md={8} className="flex justify-end">
                <Button type="primary" onClick={handleSearch}>
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* Error state */}
      {error && !loading && (
        <Card className="text-center py-10">
          <Title level={4} className="text-red-500">Error loading blog posts</Title>
          <Paragraph>{error}</Paragraph>
          <Button type="primary" onClick={refresh}>Try Again</Button>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && blogPosts.length === 0 && (
        <Card className="text-center py-16">
          <Empty 
            description="No blog posts found" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button type="primary" className="mt-4" onClick={resetFilters}>Clear Filters</Button>
        </Card>
      )}

      {/* Blog posts */}
      {!loading && !error && blogPosts.length > 0 && (
        <>
          <Row gutter={[24, 24]}>
            {blogPosts.map((post) => (
              <Col xs={24} md={12} lg={8} key={post.id}>
                <Link href={`/blog/${post.id}`}>
                  <Card 
                    hoverable 
                    className="h-full flex flex-col"
                    cover={
                      <div className="h-48 bg-red-100 flex items-center justify-center">
                        <span className="text-5xl">📝</span>
                      </div>
                    }
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <Tag color="blue">{post.isPublished ? 'Published' : 'Draft'}</Tag>
                        <Text type="secondary" className="text-sm">
                          <CalendarOutlined className="mr-1" />
                          {formatDate(post.createdTime)}
                        </Text>
                      </div>
                      <Title level={4} className="mb-2 line-clamp-2">{post.title}</Title>
                      <Paragraph className="text-gray-600 line-clamp-3">
                        {getTextPreview(post.body)}
                      </Paragraph>
                      <div className="mt-auto pt-4 flex items-center">
                        <UserOutlined className="mr-2" />
                        <Text type="secondary">{post.authorName}</Text>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {data && (
            <div className="mt-8 flex justify-center">
              <Pagination
                current={data.pageNumber}
                pageSize={data.pageSize}
                total={data.totalCount}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `Total ${total} posts`}
                onChange={goToPage}
                onShowSizeChange={(_, size) => changePageSize(size)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPage; 