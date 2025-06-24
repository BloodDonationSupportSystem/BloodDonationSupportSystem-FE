'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Typography, Tabs, Select, Button, Card, Spin, Table, Image, Space, Alert } from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

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

export default function BloodInfoPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [selectedBloodType, setSelectedBloodType] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string>('redCells');
  const [activeTab, setActiveTab] = useState('whole');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = () => {
    // No actual search needed as we have the data locally
    // This is just for user experience
    console.log('Searching for compatibility with blood type:', selectedBloodType);
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
          message="Select a Blood Type"
          description="Please select a blood type to see compatibility information."
          type="info"
          showIcon
        />
      );
    }

    if (!compatibilityData) return null;

    const dataSource = [{
      key: '1',
      bloodType: selectedBloodType,
      canDonateTo: compatibilityData.canDonateTo,
      canReceiveFrom: compatibilityData.canReceiveFrom,
    }];

    return (
      <div>
        <Table 
          dataSource={dataSource} 
          columns={wholeBloodColumns} 
          pagination={false}
          className="mb-8"
        />
        
        <Card className="bg-gray-50">
          <div className="text-center mb-4">
            <Title level={4}>Blood Type {selectedBloodType} Compatibility Summary</Title>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-300 shadow-sm">
              <Title level={5} className="text-green-700 mb-4">Can Donate To:</Title>
              <div className="flex flex-wrap gap-2">
                {compatibilityData.canDonateTo.map((type: string) => (
                  <div key={type} className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center">
                    {type}
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="border-red-300 shadow-sm">
              <Title level={5} className="text-red-700 mb-4">Can Receive From:</Title>
              <div className="flex flex-wrap gap-2">
                {compatibilityData.canReceiveFrom.map((type: string) => (
                  <div key={type} className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-center">
                    {type}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // If not logged in (and redirecting), don't render the content
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <Title level={2}>Blood Type Compatibility</Title>
          <Paragraph className="text-gray-500">
            Search for compatible blood types for whole blood transfusion or specific blood components
          </Paragraph>
        </div>

        <Card className="shadow-md mb-8">
          <Tabs 
            defaultActiveKey="whole" 
            onChange={(key) => setActiveTab(key)}
            className="mb-6"
          >
            <TabPane tab="Whole Blood" key="whole">
              <Paragraph>
                Whole blood contains all components of blood, including red cells, white cells, and plasma.
                Compatibility is determined primarily by the ABO blood group and Rh factor.
              </Paragraph>
            </TabPane>
            <TabPane tab="Blood Components" key="components">
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
            </TabPane>
          </Tabs>

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
              Search Compatibility
            </Button>
          </div>
        </Card>

        {renderResults()}

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
      </div>
    </div>
  );
} 