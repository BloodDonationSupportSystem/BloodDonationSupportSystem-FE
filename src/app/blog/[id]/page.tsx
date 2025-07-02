'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Card, Breadcrumb, Tag, Divider, Spin, Button, Alert, Space, Avatar } from 'antd';
import { ArrowLeftOutlined, UserOutlined, CalendarOutlined, HistoryOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import { getBlogPostById } from '@/services/api/blogService';
import type { BlogPost } from '@/types/blog';
import DOMPurify from 'isomorphic-dompurify';

const { Title, Text } = Typography;

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getBlogPostById(id);
        if (response.success && response.data) {
          setPost(response.data);
        } else {
          setError(response.message || 'Blog post not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load blog post');
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return dayjs(dateString).format('MMMM D, YYYY');
  };

  // Sanitize HTML content
  const createMarkup = (htmlContent: string) => {
    if (!isMounted) return { __html: '' }; // Don't render HTML during SSR
    return {
      __html: DOMPurify.sanitize(htmlContent)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert
          message="Error"
          description={error || 'Blog post not found'}
          type="error"
          showIcon
        />
        <div className="mt-4">
          <Button
            onClick={() => router.push('/blog')}
            icon={<ArrowLeftOutlined />}
          >
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link href="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href="/blog">Blog</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{post.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Button
        onClick={() => router.push('/blog')}
        icon={<ArrowLeftOutlined />}
        className="mb-6"
      >
        Back to Blog
      </Button>

      <Card className="shadow-md">
        <Title level={2} className="text-red-700">{post.title}</Title>

        <Space className="mb-4">
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text>{post.authorName || 'Unknown Author'}</Text>
          </Space>
          <Divider type="vertical" />
          <Space>
            <CalendarOutlined />
            <Text>{formatDate(post.createdTime)}</Text>
          </Space>
          {post.lastUpdatedTime && (
            <>
              <Divider type="vertical" />
              <Space>
                <HistoryOutlined />
                <Text>Updated: {formatDate(post.lastUpdatedTime)}</Text>
              </Space>
            </>
          )}
        </Space>

        <Tag color={post.isPublished ? "green" : "orange"} className="mb-4">
          {post.isPublished ? "Published" : "Draft"}
        </Tag>

        <Divider />

        <div className="blog-content prose max-w-none" dangerouslySetInnerHTML={createMarkup(post.body)} />
      </Card>
    </div>
  );
} 