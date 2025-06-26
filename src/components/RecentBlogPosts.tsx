'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Spin, Empty, Button } from 'antd';
import { ArrowRightOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import { getBlogPosts } from '@/services/api/blogService';
import type { BlogPost } from '@/types/blog';

const { Title, Paragraph } = Typography;

interface RecentBlogPostsProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function RecentBlogPosts({ limit = 3, showViewAll = true }: RecentBlogPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      setLoading(true);
      try {
        const response = await getBlogPosts({
          pageNumber: 1,
          pageSize: limit,
          sortBy: 'createdTime',
          sortAscending: false,
          isPublished: true
        });

        if (response.success && response.data) {
          setPosts(response.data);
        } else {
          console.error('Error in blog posts response:', response);
          setError(response.message || 'Failed to load blog posts');
        }
      } catch (err: any) {
        console.error('Error fetching blog posts:', err);
        setError(err.message || 'An error occurred while fetching blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, [limit]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty description="No blog posts found" />
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-12">
          <Title level={2} className="mb-0">Recent Blog Posts</Title>
          {showViewAll && (
            <Link href="/blog">
              <Button type="link" className="text-red-600 flex items-center">
                View All <ArrowRightOutlined />
              </Button>
            </Link>
          )}
        </div>
        <Row gutter={[32, 32]}>
          {posts.map((post) => (
            <Col xs={24} md={8} key={post.id}>
              <Link href={`/blog/${post.id}`}>
                <Card 
                  hoverable 
                  className="h-full shadow-sm hover:shadow-md transition-shadow"
                  cover={
                    <div className="h-48 bg-red-100 flex items-center justify-center">
                      <span className="text-5xl">📝</span>
                    </div>
                  }
                >
                  <div className="mb-2">
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                      {formatDate(post.createdTime)}
                    </span>
                  </div>
                  <Title level={4} className="line-clamp-2">{post.title}</Title>
                  <Paragraph className="text-gray-600 mb-4 line-clamp-3">
                    {getTextPreview(post.body)}
                  </Paragraph>
                  <div className="flex items-center text-gray-500">
                    <UserOutlined className="mr-2" />
                    <span>{post.authorName}</span>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
} 