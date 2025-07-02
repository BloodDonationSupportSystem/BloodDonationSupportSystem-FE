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

  // Sanitize HTML content
  const createSafeHtml = (content: string) => {
    if (!isMounted) return { __html: '' }; // Don't render HTML during SSR
    return {
      __html: DOMPurify.sanitize(content.replace(/<div class="component-image">[\s\S]*?<\/div>/g, ''))
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
          className={selectedDoc.documentType === 'BloodType' ? 'blood-document-content' : 'component-document-content'}
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
    </div>
  );
} 