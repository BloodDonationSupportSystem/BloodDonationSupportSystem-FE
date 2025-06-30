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

const { Title, Paragraph, Text } = Typography;

export default function BloodInfoPage() {
  const dispatch = useDispatch();
  const { data: bloodTypeDocuments, isLoading, error } = useBloodDocuments();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<string>('bloodTypes');

  // Filter documents by type
  const bloodTypes = bloodTypeDocuments?.filter(doc => doc.documentType === 'BloodType') || [];
  const componentTypes = bloodTypeDocuments?.filter(doc => doc.documentType === 'ComponentType') || [];

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

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Reset selected document when changing tabs
    if (key === 'bloodTypes' && bloodTypes.length > 0) {
      setSelectedDoc(bloodTypes[0]);
    } else if (key === 'components' && componentTypes.length > 0) {
      setSelectedDoc(componentTypes[0]);
    } else {
      setSelectedDoc(null);
    }
  };

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error('Failed to load blood type documents. Please try again later.');
    }
  }, [error]);

  const renderDocumentsList = (documents: Document[]) => {
    if (isLoading) {
      return <Spin size="large" className="my-8 flex justify-center" />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={documents}
        renderItem={(document) => (
          <List.Item
            className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedDoc?.id === document.id ? 'bg-red-50' : ''}`}
            onClick={() => handleSelectDocument(document)}
          >
            <List.Item.Meta
              avatar={
                document.documentType === 'BloodType' 
                  ? <FileTextOutlined className="text-2xl text-red-500" /> 
                  : <ExperimentOutlined className="text-2xl text-blue-500" />
              }
              title={<Text strong>{document.title}</Text>}
              description={`Created: ${new Date(document.createdDate).toLocaleDateString()}`}
            />
          </List.Item>
        )}
      />
    );
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
          dangerouslySetInnerHTML={{ __html: selectedDoc.content.replace(/<div class="component-image">[\s\S]*?<\/div>/g, '') }}
        />
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <Title level={2}>Blood Information Center</Title>
          <Paragraph className="text-gray-500">
            Learn about blood types, their characteristics, and blood components
          </Paragraph>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          className="mb-6"
          type="card"
          items={[
            {
              key: 'bloodTypes',
              label: (
                <span>
                  <FileTextOutlined /> Blood Types
                </span>
              )
            },
            {
              key: 'components',
              label: (
                <span>
                  <ExperimentOutlined /> Blood Components
                </span>
              )
            }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card 
              title={activeTab === 'bloodTypes' ? "Blood Type Documents" : "Blood Component Documents"} 
              className="shadow-sm"
            >
              {activeTab === 'bloodTypes' 
                ? renderDocumentsList(bloodTypes)
                : renderDocumentsList(componentTypes)
              }
            </Card>
          </div>
          <div className="md:col-span-3">
            {renderSelectedDocument()}
          </div>
        </div>

        <Card className="mt-8 bg-blue-50">
          <div className="flex items-start">
            <InfoCircleOutlined className="text-blue-500 text-xl mt-1 mr-3" />
            <div>
              <Title level={5} className="text-blue-700">Important Note</Title>
              <Paragraph className="text-blue-600">
                This information is provided as a general guide. In emergency situations, 
                medical professionals will determine the most appropriate blood type for transfusion 
                based on testing and specific patient needs. Always consult with healthcare providers 
                for medical decisions.
              </Paragraph>
            </div>
          </div>
        </Card>

        <Card className="mt-8">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card className="h-full border-red-200">
                <Title level={4} className="text-red-600">Ready to Donate?</Title>
                <Paragraph>
                  Now that you understand blood types, consider donating blood to help save lives.
                  Your donation can make a critical difference for patients in need.
                </Paragraph>
                <Link href="/donate">
                  <Button type="primary" className="bg-red-600 hover:bg-red-700">
                    Schedule a Donation
                  </Button>
                </Link>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="h-full border-blue-200">
                <Title level={4} className="text-blue-600">Need More Information?</Title>
                <Paragraph>
                  Have questions about blood donation, compatibility, or how you can help?
                  Our team is ready to provide you with all the information you need.
                </Paragraph>
                <Link href="/contact">
                  <Button type="default">Contact Us</Button>
                </Link>
              </Card>
            </Col>
          </Row>
        </Card>

        <style jsx global>{`
          .blood-document-content h1 {
            font-size: 1.8rem;
            color: #d32f2f;
            margin-bottom: 1rem;
          }
          
          .blood-document-content h2 {
            font-size: 1.4rem;
            color: #d32f2f;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          
          .blood-document-content h3 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .blood-document-content .summary {
            background-color: #f8f8f8;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
          }
          
          .blood-document-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .blood-document-content li {
            margin-bottom: 0.5rem;
          }
          
          .blood-document-content section {
            margin-bottom: 2rem;
          }
          
          .blood-document-content .compatibility-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          
          .blood-document-content .can-donate,
          .blood-document-content .can-receive {
            background-color: #f1f5f9;
            padding: 1rem;
            border-radius: 0.5rem;
          }
          
          .blood-document-content .can-donate {
            border-left: 4px solid #15803d;
          }
          
          .blood-document-content .can-receive {
            border-left: 4px solid #b91c1c;
          }
          
          .blood-document-content .medical-relevance {
            background-color: #f0f9ff;
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 4px solid #0369a1;
          }
          
          /* Additional styles for component documents */
          .component-document-content h1 {
            font-size: 1.8rem;
            color: #1e40af;
            margin-bottom: 1rem;
          }
          
          .component-document-content h2 {
            font-size: 1.4rem;
            color: #1e40af;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }
          
          .component-document-content h3 {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .component-document-content section {
            margin-bottom: 2rem;
          }
          
          .component-document-content ul, 
          .component-document-content ol {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .component-document-content li {
            margin-bottom: 0.5rem;
          }
          
          .component-document-content table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.5rem;
          }
          
          .component-document-content th, 
          .component-document-content td {
            border: 1px solid #e2e8f0;
            padding: 0.75rem;
            text-align: left;
          }
          
          .component-document-content th {
            background-color: #f1f5f9;
            font-weight: 600;
          }
          
          .component-document-content .donation-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
          
          .component-document-content .donation-method {
            background-color: #f1f5f9;
            padding: 1rem;
            border-radius: 0.5rem;
          }
          
          .component-document-content dt {
            font-weight: 600;
            margin-top: 0.75rem;
          }
          
          .component-document-content dd {
            margin-left: 1.5rem;
            margin-bottom: 0.5rem;
          }
        `}</style>
      </div>
    </div>
  );
} 