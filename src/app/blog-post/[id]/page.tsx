"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/Layout/Header";
import Footer from "../../../components/Layout/Footer";
import { Card, Typography, Tag, Spin, Alert } from "antd";
import type { BlogPost } from "../../../types/blog";

const { Title, Paragraph } = Typography;

async function getBlogPost(id: string): Promise<BlogPost | null> {
  const res = await fetch(`http://localhost:5222/api/BlogPosts/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default function BlogPostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    getBlogPost(params.id as string)
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load blog post.");
        setLoading(false);
      });
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-10 px-2 md:px-0">
          <Spin size="large" tip="Loading..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-10 px-2 md:px-0">
          <Alert message={error || "Blog post not found."} type="error" showIcon />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-2 md:px-0">
        <div className="max-w-2xl w-full mx-auto rounded-2xl bg-red-50 shadow-sm py-8 px-4 mb-8 text-center">
          <span className="text-5xl mb-2 inline-block" role="img" aria-label="Blood Drop">🩸</span>
          <Title level={1} className="!text-red-500 !font-extrabold mb-2">{post.title}</Title>
          <Paragraph className="text-gray-700 text-lg mb-0">
            <span className="font-semibold text-blue-600">Author:</span> {post.authorName}
          </Paragraph>
        </div>
        <Card className="max-w-2xl w-full mx-auto !rounded-xl !shadow-md mb-8" bodyStyle={{ padding: 32 }}>
          <Paragraph className="text-gray-800 text-lg mb-6">
            {post.body}
          </Paragraph>
          <Tag color={post.isPublished ? "red" : "default"} className="mt-2">
            {post.isPublished ? "Published" : "Draft"}
          </Tag>
        </Card>
      </main>
      <Footer />
    </div>
  );
} 