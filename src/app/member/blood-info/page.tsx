'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Typography, Tabs, Select, Button, Card, Spin, Table, Space, Alert, Divider, List, Row, Col, Tag, Empty } from 'antd';
import { SearchOutlined, InfoCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import DOMPurify from 'isomorphic-dompurify';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone);

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Blood compatibility data
const wholeBloodCompatibility = {
  'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
  'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
  'O+': { canDonateTo: ['A+', 'B+', 'AB+', 'O+'], canReceiveFrom: ['O+', 'O-'] },
  'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
};

// Component compatibility data
const componentCompatibility = {
  'redCells': {
    'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
    'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
    'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
    'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
    'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
    'O+': { canDonateTo: ['A+', 'B+', 'AB+', 'O+'], canReceiveFrom: ['O+', 'O-'] },
    'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
  },
  'plasma': {
    'A+': { canDonateTo: ['A+', 'A-', 'O+', 'O-'], canReceiveFrom: ['A+', 'AB+'] },
    'A-': { canDonateTo: ['A+', 'A-', 'O+', 'O-'], canReceiveFrom: ['A-', 'AB-'] },
    'B+': { canDonateTo: ['B+', 'B-', 'O+', 'O-'], canReceiveFrom: ['B+', 'AB+'] },
    'B-': { canDonateTo: ['B+', 'B-', 'O+', 'O-'], canReceiveFrom: ['B-', 'AB-'] },
    'AB+': { canDonateTo: ['AB+', 'A+', 'B+', 'O+'], canReceiveFrom: ['AB+'] },
    'AB-': { canDonateTo: ['AB-', 'A-', 'B-', 'O-', 'AB+', 'A+', 'B+', 'O+'], canReceiveFrom: ['AB-'] },
    'O+': { canDonateTo: ['O+', 'O-'], canReceiveFrom: ['O+', 'A+', 'B+', 'AB+'] },
    'O-': { canDonateTo: ['O-', 'O+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
  },
  'platelets': {
    'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'A-': { canDonateTo: ['A-', 'AB-', 'A+', 'AB+'], canReceiveFrom: ['A-', 'AB-', 'O-'] },
    'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'B-': { canDonateTo: ['B-', 'AB-', 'B+', 'AB+'], canReceiveFrom: ['B-', 'AB-', 'O-'] },
    'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'] },
    'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['AB-'] },
    'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O+', 'O-'] },
    'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
  },
};

// Interface for blood type document
interface BloodTypeDocument {
  id: string;
  title: string;
  content: string;
  documentType: string;
  createdDate: string;
  createdBy: string;
  createdByName: string;
}

interface DocumentsResponse {
  data: BloodTypeDocument[];
  count: number;
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
}

export default function BloodInfoPage() {
  const { user } = useAuth();
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string>('redCells');
  const [activeTab, setActiveTab] = useState('whole');
  const [documentsTab, setDocumentsTab] = useState('compatibility');
  const [bloodTypeDocuments, setBloodTypeDocuments] = useState<BloodTypeDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<BloodTypeDocument | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch blood type documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoadingDocuments(true);
        const response = await axios.get<DocumentsResponse>('/api/Documents/all');
        if (response.data.success) {
          setBloodTypeDocuments(response.data.data);
        } else {
          console.error('Failed to fetch documents:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, []);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = () => {
    // No actual search needed as we have the data locally
    // This is just for user experience
    console.log('Searching for compatibility with blood type:', selectedBloodType);

    // If there's a document for the selected blood type, select it
    if (selectedBloodType && documentsTab === 'documents') {
      const document = bloodTypeDocuments.find(doc =>
        doc.title.includes(selectedBloodType)
      );
      if (document) {
        setSelectedDocument(document);
      }
    }
  };

  const getCompatibilityData = () => {
    if (!selectedBloodType) return null;

    if (activeTab === 'whole') {
      return wholeBloodCompatibility[selectedBloodType as keyof typeof wholeBloodCompatibility];
    } else {
      return componentCompatibility[selectedComponent as keyof typeof componentCompatibility][selectedBloodType as keyof typeof wholeBloodCompatibility];
    }
  };

  const compatibilityData = getCompatibilityData();

  const wholeBloodColumns = [
    {
      title: 'Blood Type',
      dataIndex: 'bloodType',
      key: 'bloodType',
    },
    {
      title: 'Can Donate To',
      dataIndex: 'canDonateTo',
      key: 'canDonateTo',
      render: (types: string[]) => (
        <Space>
          {types.map(type => (
            <Text key={type} className="bg-red-100 px-2 py-1 rounded">{type}</Text>
          ))}
        </Space>
      ),
    },
    {
      title: 'Can Receive From',
      dataIndex: 'canReceiveFrom',
      key: 'canReceiveFrom',
      render: (types: string[]) => (
        <Space>
          {types.map(type => (
            <Text key={type} className="bg-green-100 px-2 py-1 rounded">{type}</Text>
          ))}
        </Space>
      ),
    },
  ];

  const bloodTypeOptions = bloodTypes.map(type => ({
    value: type,
    label: type,
  }));

  const renderResults = () => {
    if (!selectedBloodType) {
      return (
        <Alert
          message="No Blood Type Selected"
          description="Please select a blood type to view compatibility information."
          type="info"
          showIcon
        />
      );
    }

    if (!compatibilityData) return null;

    return (
      <Card className="shadow-sm">
        <div className="text-center mb-4">
          <Title level={3}>
            Blood Type: <span className="text-red-600">{selectedBloodType}</span>
          </Title>
          <Paragraph className="text-gray-500">
            {activeTab === 'whole'
              ? 'Whole Blood Compatibility'
              : `${selectedComponent === 'redCells' ? 'Red Blood Cells' : selectedComponent === 'plasma' ? 'Plasma' : 'Platelets'} Compatibility`}
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-green-200">
            <Title level={4} className="text-green-700">Can Donate To:</Title>
            <div className="flex flex-wrap gap-2 mt-4">
              {compatibilityData.canDonateTo.map(type => (
                <Tag key={type} color="green" className="text-base py-1 px-3">
                  {type}
                </Tag>
              ))}
            </div>
          </Card>

          <Card className="border-red-200">
            <Title level={4} className="text-red-700">Can Receive From:</Title>
            <div className="flex flex-wrap gap-2 mt-4">
              {compatibilityData.canReceiveFrom.map(type => (
                <Tag key={type} color="red" className="text-base py-1 px-3">
                  {type}
                </Tag>
              ))}
            </div>
          </Card>
        </div>

        <Paragraph className="mt-6 text-gray-600">
          {activeTab === 'whole' ? (
            <>
              <strong>Note:</strong> Whole blood compatibility is based on both red blood cells and plasma compatibility.
              In emergency situations, O- is the universal donor for red blood cells, and AB+ is the universal recipient.
            </>
          ) : (
            <>
              <strong>Note:</strong> Component compatibility can differ from whole blood. For red cells, O- is the universal donor.
              For plasma, AB is the universal donor. Platelet compatibility is more complex and ideally matched to the recipient.
            </>
          )}
        </Paragraph>
      </Card>
    );
  };

  const renderDocumentsList = () => {
    if (loadingDocuments) {
      return <Spin size="large" className="my-8 flex justify-center" />;
    }

    if (bloodTypeDocuments.length === 0) {
      return <Empty description="No documents found" />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={bloodTypeDocuments}
        renderItem={(document) => (
          <List.Item
            className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedDocument?.id === document.id ? 'bg-red-50' : ''}`}
            onClick={() => setSelectedDocument(document)}
          >
            <List.Item.Meta
              title={document.title}
              description={`Created: ${dayjs(document.createdDate).format('MMM D, YYYY')}`}
            />
          </List.Item>
        )}
      />
    );
  };

  // Sanitize HTML content
  const createSafeHtml = (content: string) => {
    if (!isMounted) return { __html: '' }; // Don't render HTML during SSR
    return {
      __html: DOMPurify.sanitize(content)
    };
  };

  const renderSelectedDocument = () => {
    if (!selectedDocument) {
      return (
        <Alert
          message="No Document Selected"
          description="Please select a blood type document from the list to view detailed information."
          type="info"
          showIcon
        />
      );
    }

    return (
      <Card className="shadow-sm">
        <Title level={4}>{selectedDocument.title}</Title>
        <Divider />
        <div
          className="blood-document-content"
          dangerouslySetInnerHTML={createSafeHtml(selectedDocument.content)}
        />
      </Card>
    );
  };

  return (
    <>
      <div className="text-center mb-6">
        <Title level={2}>Blood Type Information</Title>
        <Paragraph className="text-gray-500">
          Learn about blood types, compatibility, and detailed medical information
        </Paragraph>
      </div>

      <Card className="mb-6">
        <Tabs
          defaultActiveKey="compatibility"
          onChange={(key) => setDocumentsTab(key)}
          className="mb-6"
          items={[
            {
              key: 'compatibility',
              label: 'Compatibility Calculator',
              children: (
                <Tabs
                  defaultActiveKey="whole"
                  onChange={(key) => setActiveTab(key)}
                  className="mb-6"
                  items={[
                    {
                      key: 'whole',
                      label: 'Whole Blood',
                      children: (
                        <Paragraph>
                          Whole blood contains all components of blood, including red cells, white cells, and plasma.
                          Compatibility is determined primarily by the ABO blood group and Rh factor.
                        </Paragraph>
                      )
                    },
                    {
                      key: 'components',
                      label: 'Blood Components',
                      children: (
                        <div>
                          <div className="mb-4">
                            <Select
                              placeholder="Select Blood Component"
                              style={{ width: 200 }}
                              value={selectedComponent}
                              onChange={(value) => setSelectedComponent(value)}
                            >
                              <Option value="redCells">Red Blood Cells</Option>
                              <Option value="plasma">Plasma</Option>
                              <Option value="platelets">Platelets</Option>
                            </Select>
                          </div>
                          <Paragraph>
                            Blood components have different compatibility rules compared to whole blood.
                            Red cells follow the same rules as whole blood, but plasma and platelets have reverse compatibility.
                          </Paragraph>
                        </div>
                      )
                    }
                  ]}
                />
              )
            },
            {
              key: 'documents',
              label: 'Blood Type Documents',
              children: (
                <Paragraph>
                  Access detailed medical information about different blood types, their characteristics,
                  and medical significance.
                </Paragraph>
              )
            }
          ]}
        />

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Blood Type
            </label>
            <Select
              placeholder="Select Blood Type"
              style={{ width: '100%' }}
              options={bloodTypeOptions}
              onChange={(value) => setSelectedBloodType(value)}
            />
          </div>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700"
          >
            {documentsTab === 'compatibility' ? 'Search Compatibility' : 'Find Document'}
          </Button>
        </div>
      </Card>

      {documentsTab === 'compatibility' ? (
        renderResults()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card title="Blood Type Documents" className="shadow-sm">
              {renderDocumentsList()}
            </Card>
          </div>
          <div className="md:col-span-2">
            {renderSelectedDocument()}
          </div>
        </div>
      )}

      <Card className="mt-6 bg-blue-50">
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
      `}</style>
    </>
  );
} 