import type { BlogPost } from "../types/blog";
import Link from "next/link";
import { Card, Typography, Tag } from "antd";
import DOMPurify from 'isomorphic-dompurify';

interface BlogPostItemProps {
  post: BlogPost;
}

export default function BlogPostItem({ post }: BlogPostItemProps) {
  // Sanitize HTML content
  const createMarkup = (htmlContent: string) => {
    return {
      __html: DOMPurify.sanitize(htmlContent)
    };
  };

  // Extract plain text from HTML for preview
  const getTextPreview = (html: string, maxLength: number = 150) => {
    if (typeof document !== 'undefined') {
      // Client-side: Use DOM to parse HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const text = temp.textContent || temp.innerText || '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    } else {
      // Server-side: Use regex to strip HTML tags
      const text = html.replace(/<[^>]*>?/gm, '');
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
  };

  return (
    <Card
      className="!shadow-md !rounded-xl !border-blue-100 hover:!border-blue-400 transition-all"
      bodyStyle={{ padding: 20 }}
      title={
        <Typography.Title level={3} className="!mb-0 !text-blue-700 !font-bold">
          <Link href={`/blog/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </Typography.Title>
      }
      extra={<span className="text-3xl mr-2" role="img" aria-label="Blood Drop">🩸</span>}
    >
      <Typography.Paragraph className="mb-2">
        <span className="font-semibold text-blue-600">Author:</span> {post.authorName}
      </Typography.Paragraph>
      <Typography.Paragraph className="mb-2 text-gray-700">
        {getTextPreview(post.body)}
      </Typography.Paragraph>
      <Tag color={post.isPublished ? "red" : "default"} className="mt-2">
        {post.isPublished ? "Published" : "Draft"}
      </Tag>
    </Card>
  );
} 