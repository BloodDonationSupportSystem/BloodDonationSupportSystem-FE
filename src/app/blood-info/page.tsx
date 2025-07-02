'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Spin, Alert, Divider, List, Row, Col, Tabs } from 'antd';
import { SearchOutlined, InfoCircleOutlined, FileTextOutlined, ExperimentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useBloodDocuments } from '@/hooks/api/useBloodDocuments';
import { Document } from '@/services/api/documentsService';
import { RootState } from '@/store';
import { selectDocument } from '@/store/slices/bloodInfoSlice';
import DOMPurify from 'isomorphic-dompurify';

const { Title, Paragraph, Text } = Typography;

export default function BloodInfoPage() {
  const dispatch = useDispatch();
  const { data: bloodTypeDocuments, isLoading, error } = useBloodDocuments();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string>('bloodTypes');
  const [isMounted, setIsMounted] = useState(false);

  // Filter documents by type
  const bloodTypes = bloodTypeDocuments?.filter(doc => doc.documentType === 'BloodType') || [];
  const componentTypes = bloodTypeDocuments?.filter(doc => doc.documentType === 'ComponentType') || [];

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (bloodTypeDocuments && bloodTypeDocuments.length > 0 && !selectedDoc) {
      // Set default document based on active tab
      if (activeTab === 'bloodTypes' && bloodTypes.length > 0) {
        setSelectedDoc(bloodTypes[0]);
      } else if (activeTab === 'components' && componentTypes.length > 0) {
        setSelectedDoc(componentTypes[0]);
      }
    }
  }, [bloodTypeDocuments, selectedDoc, activeTab, bloodTypes, componentTypes]);

  // Handle document selection
  const handleSelectDocument = (document: Document) => {
    setSelectedDoc(document);
    dispatch(selectDocument(document));
  };

  // Sanitize HTML content and remove images
  const createSafeHtml = (content: string) => {
    if (!isMounted) return { __html: '' }; // Don't render HTML during SSR

    // Remove image tags and their containers
    const contentWithoutImages = content
      .replace(/<img[^>]*>/g, '') // Remove img tags
      .replace(/<div[^>]*>\s*<\/div>/g, '') // Remove empty divs
      .replace(/<figure[^>]*>[\s\S]*?<\/figure>/g, '') // Remove figure elements
      .replace(/<div class="component-image">[\s\S]*?<\/div>/g, ''); // Remove specific image containers

    return {
      __html: DOMPurify.sanitize(contentWithoutImages)
    };
  };

  const renderSelectedDocument = () => {
    if (!selectedDoc) {
      return (
        <Alert
          message="No Document Selected"
          description="Please select a document from the list to view detailed information."
          type="info"
          showIcon
        />
      );
    }

    return (
      <Card className="shadow-sm">
        <Title level={3}>{selectedDoc.title}</Title>
        <Divider />
        <div
          className={`${selectedDoc.documentType === 'BloodType' ? 'blood-document-content' : 'component-document-content'} prose max-w-none`}
          dangerouslySetInnerHTML={createSafeHtml(selectedDoc.content)}
        />
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Title level={2}>Blood Type Information</Title>
          <Paragraph className="text-gray-500">
            Learn about blood types, compatibility, and detailed medical information
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card className="shadow-sm">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'bloodTypes',
                    label: (
                      <span>
                        <InfoCircleOutlined /> Blood Types
                      </span>
                    ),
                    children: (
                      <List
                        loading={isLoading}
                        dataSource={bloodTypes}
                        renderItem={(doc) => (
                          <List.Item
                            onClick={() => handleSelectDocument(doc)}
                            className={`cursor-pointer hover:bg-gray-50 ${selectedDoc?.id === doc.id ? 'bg-red-50' : ''}`}
                          >
                            <List.Item.Meta
                              title={doc.title}
                              description={`Document type: ${doc.documentType}`}
                            />
                          </List.Item>
                        )}
                      />
                    ),
                  },
                  {
                    key: 'components',
                    label: (
                      <span>
                        <ExperimentOutlined /> Blood Components
                      </span>
                    ),
                    children: (
                      <List
                        loading={isLoading}
                        dataSource={componentTypes}
                        renderItem={(doc) => (
                          <List.Item
                            onClick={() => handleSelectDocument(doc)}
                            className={`cursor-pointer hover:bg-gray-50 ${selectedDoc?.id === doc.id ? 'bg-red-50' : ''}`}
                          >
                            <List.Item.Meta
                              title={doc.title}
                              description={`Document type: ${doc.documentType}`}
                            />
                          </List.Item>
                        )}
                      />
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} md={16}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : error ? (
              <Alert
                message="Error"
                description={error instanceof Error ? error.message : String(error)}
                type="error"
                showIcon
              />
            ) : (
              renderSelectedDocument()
            )}
          </Col>
        </Row>
      </div>

      {/* Add CSS for proper HTML rendering */}
      <style jsx global>{`
        .blood-document-content,
        .component-document-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        
        .blood-document-content h1,
        .component-document-content h1 {
          font-size: 2rem;
          color: #d32f2f;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .blood-document-content h2,
        .component-document-content h2 {
          font-size: 1.75rem;
          color: #d32f2f;
          margin-top: 1.75rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .blood-document-content h3,
        .component-document-content h3 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #e53935;
        }
        
        .blood-document-content h4,
        .component-document-content h4 {
          font-size: 1.25rem;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #e53935;
        }
        
        .blood-document-content h5,
        .component-document-content h5,
        .blood-document-content h6,
        .component-document-content h6 {
          font-size: 1.1rem;
          margin-top: 1.1rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        .blood-document-content p,
        .component-document-content p {
          margin-bottom: 1.25rem;
          font-size: 1rem;
        }
        
        .blood-document-content ul,
        .component-document-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
          padding-left: 0;
        }
        
        .blood-document-content ol,
        .component-document-content ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
          padding-left: 0;
        }
        
        .blood-document-content li,
        .component-document-content li {
          margin-bottom: 0.5rem;
        }
        
        .blood-document-content table,
        .component-document-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .blood-document-content th,
        .component-document-content th {
          background-color: #f8f9fa;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid #e5e7eb;
          color: #d32f2f;
        }
        
        .blood-document-content td,
        .component-document-content td {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          vertical-align: top;
        }
        
        .blood-document-content tr:nth-child(even),
        .component-document-content tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .blood-document-content blockquote,
        .component-document-content blockquote {
          border-left: 4px solid #e53935;
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 1.5rem 0;
          background-color: #fef2f2;
          color: #111;
          font-style: italic;
        }
        
        .blood-document-content pre,
        .component-document-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }
        
        .blood-document-content code,
        .component-document-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
          font-size: 0.9em;
        }
        
        .blood-document-content strong,
        .component-document-content strong {
          font-weight: 600;
        }
        
        .blood-document-content em,
        .component-document-content em {
          font-style: italic;
        }
        
        .blood-document-content a,
        .component-document-content a {
          color: #d32f2f;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 2px;
        }
        
        .blood-document-content a:hover,
        .component-document-content a:hover {
          color: #b71c1c;
        }
        
        .blood-document-content hr,
        .component-document-content hr {
          border: 0;
          border-top: 1px solid #e5e7eb;
          margin: 2rem 0;
        }
        
        .blood-document-content .key-value,
        .component-document-content .key-value {
          display: flex;
          margin-bottom: 0.5rem;
        }
        
        .blood-document-content .key,
        .component-document-content .key {
          font-weight: 600;
          min-width: 150px;
          color: #d32f2f;
        }
        
        .blood-document-content .value,
        .component-document-content .value {
          flex: 1;
        }
      `}</style>
    </div>
  );
} 