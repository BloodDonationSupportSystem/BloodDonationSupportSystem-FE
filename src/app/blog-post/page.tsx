"use client";
import { Typography, Row, Col, Pagination as AntPagination, Select, Spin, Alert } from "antd";
import BlogPostList from "../../components/BlogPostList";
import { useBlogPosts } from "../../hooks/useBlogPosts";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function BlogPostPage() {
  const {
    data,
    loading,
    error,
    pageNumber,
    pageSize,
    setPageSize,
    goToPage,
  } = useBlogPosts();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section for coherence with Home Page */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-red-50 shadow-sm py-8 px-4 mb-10">
          <Title level={1} className="text-center !text-red-500 !font-extrabold mb-2">Blog Posts</Title>
          <Paragraph className="text-center text-gray-700 text-lg mb-0">
            Stay informed and inspired! Read our latest articles about blood donation, health tips, and community stories.
          </Paragraph>
        </div>
        <div className="max-w-4xl mx-auto">
          {loading && (
            <div className="flex justify-center my-8">
              <Spin size="large" tip="Loading..." />
            </div>
          )}
          {error && (
            <div className="flex justify-center my-8">
              <Alert message={error} type="error" showIcon />
            </div>
          )}
          {data && (
            <>
              <Row gutter={[24, 24]}>
                {data.data.map((post) => (
                  <Col xs={24} sm={24} md={12} key={post.id}>
                    <BlogPostList posts={[post]} />
                  </Col>
                ))}
              </Row>
              <div className="h-10" />
              <div className="flex flex-col items-center justify-center gap-4 mb-10">
                <div className="flex flex-row items-center gap-6">
                  <AntPagination
                    current={data.pageNumber}
                    total={data.totalPages * pageSize}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    onChange={goToPage}
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600">Page Size:</span>
                    <Select
                      value={pageSize}
                      onChange={setPageSize}
                      className="w-24"
                      size="middle"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <Option key={size} value={size}>{size}</Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 