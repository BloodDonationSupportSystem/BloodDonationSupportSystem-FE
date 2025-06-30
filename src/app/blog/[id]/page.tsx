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
    return {
      __html: DOMPurify.sanitize(htmlContent)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => router.push('/blog')}>
              Return to Blog
            </Button>
          }
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <Alert
          message="Blog Post Not Found"
          description="The blog post you are looking for does not exist or has been removed."
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => router.push('/blog')}>
              Return to Blog
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb navigation */}
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: 'Home',
            href: '/'
          },
          {
            title: 'Blog',
            href: '/blog'
          },
          {
            title: post.title || 'Blog Post',
          },
        ]}
      />

      {/* Back button */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        className="mb-6" 
        onClick={() => router.push('/blog')}
      >
        Back to Blog
      </Button>

      {/* Blog post content */}
      <Card className="shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <Tag color={post.isPublished ? "green" : "orange"} className="text-sm px-3 py-1">
            {post.isPublished ? "Published" : "Draft"}
          </Tag>
          <Space>
            <Text type="secondary">
              <HistoryOutlined className="mr-1" />
              Last updated: {formatDate(post.lastUpdatedTime)}
            </Text>
          </Space>
        </div>

        <Title level={1} className="mb-6">{post.title}</Title>

        <div className="flex items-center mb-6">
          <Avatar icon={<UserOutlined />} size="large" className="mr-3" />
          <div>
            <Text strong className="block">{post.authorName}</Text>
            <Text type="secondary">
              <CalendarOutlined className="mr-1" />
              {formatDate(post.createdTime)}
            </Text>
          </div>
        </div>

        <Divider />

        {/* Blog content with HTML */}
        <div 
          className="prose max-w-none blog-content"
          dangerouslySetInnerHTML={createMarkup(post.body)}
        />
      </Card>
    </div>
  );
} 