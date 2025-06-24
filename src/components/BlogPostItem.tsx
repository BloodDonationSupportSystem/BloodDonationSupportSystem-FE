import type { BlogPost } from "../types/blog";
import Link from "next/link";
import { Card, Typography, Tag } from "antd";

interface BlogPostItemProps {
  post: BlogPost;
}

export default function BlogPostItem({ post }: BlogPostItemProps) {
  return (
    <Card
      className="!shadow-md !rounded-xl !border-blue-100 hover:!border-blue-400 transition-all"
      bodyStyle={{ padding: 20 }}
      title={
        <Typography.Title level={3} className="!mb-0 !text-blue-700 !font-bold">
          <Link href={`/blog-post/${post.id}`} className="hover:underline">
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
        {post.body}
      </Typography.Paragraph>
      <Tag color={post.isPublished ? "red" : "default"} className="mt-2">
        {post.isPublished ? "Published" : "Draft"}
      </Tag>
    </Card>
  );
} 