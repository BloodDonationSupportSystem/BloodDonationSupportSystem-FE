'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Typography, 
  Card, 
  Spin, 
  Tabs, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Button, 
  DatePicker, 
  Select, 
  Alert, 
  Tag, 
  Tooltip, 
  Space, 
  Empty,
  Divider
} from 'antd';
import { 
  LineChartOutlined, 
  HeartOutlined, 
  MedicineBoxOutlined, 
  RiseOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined, 
  DownloadOutlined, 
  PrinterOutlined, 
  ShareAltOutlined,
  DashboardOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock health data
const mockHealthData = {
  bloodPressure: {
    systolic: 120,
    diastolic: 80,
    history: [
      { date: '2023-11-10', systolic: 120, diastolic: 80 },
      { date: '2023-08-02', systolic: 118, diastolic: 78 },
      { date: '2023-05-05', systolic: 122, diastolic: 82 },
      { date: '2023-02-10', systolic: 125, diastolic: 85 },
      { date: '2022-11-15', systolic: 121, diastolic: 81 },
    ],
    status: 'normal', // normal, warning, critical
  },
  hemoglobin: {
    value: 14.2, // g/dL
    history: [
      { date: '2023-11-10', value: 14.2 },
      { date: '2023-08-02', value: 13.8 },
      { date: '2023-05-05', value: 14.0 },
      { date: '2023-02-10', value: 13.5 },
      { date: '2022-11-15', value: 13.9 },
    ],
    status: 'normal', // normal, warning, critical
    minRecommended: 13.0,
  },
  ironLevel: {
    value: 95, // μg/dL
    history: [
      { date: '2023-11-10', value: 95 },
      { date: '2023-08-02', value: 92 },
      { date: '2023-05-05', value: 90 },
      { date: '2023-02-10', value: 88 },
      { date: '2022-11-15', value: 91 },
    ],
    status: 'normal', // normal, warning, critical
    minRecommended: 65,
  },
  platelets: {
    value: 250, // thousand/μL
    history: [
      { date: '2023-11-10', value: 250 },
      { date: '2023-08-02', value: 245 },
      { date: '2023-05-05', value: 240 },
      { date: '2023-02-10', value: 255 },
      { date: '2022-11-15', value: 248 },
    ],
    status: 'normal', // normal, warning, critical
    minRecommended: 150,
  },
  weight: {
    value: 70.5, // kg
    history: [
      { date: '2023-11-10', value: 70.5 },
      { date: '2023-08-02', value: 71.0 },
      { date: '2023-05-05', value: 71.5 },
      { date: '2023-02-10', value: 72.0 },
      { date: '2022-11-15', value: 72.5 },
    ],
  },
  bmi: {
    value: 23.5,
    status: 'normal', // underweight, normal, overweight, obese
  },
  lastCheckupDate: '2023-11-10',
  nextRecommendedCheckup: '2024-02-10',
  donationEligibility: {
    eligible: true,
    reason: null,
    nextEligibleDate: '2023-12-20',
  },
  medicalNotes: [
    {
      date: '2023-11-10',
      doctor: 'Dr. Nguyen',
      notes: 'Patient is in excellent health, cleared for regular blood donations.',
    },
    {
      date: '2023-05-05',
      doctor: 'Dr. Tran',
      notes: 'Hemoglobin slightly low, recommended iron supplements for one month.',
    },
  ],
  recoveryTips: [
    'Stay hydrated by drinking plenty of water',
    'Consume iron-rich foods like spinach, red meat, and beans',
    'Avoid strenuous physical activity for 24 hours after donation',
    'Get adequate rest and sleep to help your body recover',
    'Avoid alcohol for 24 hours after donation',
  ],
};

// Mock donation data
const mockDonationData = [
  {
    id: 1,
    date: '2023-11-10',
    type: 'Whole Blood',
    volume: 450, // mL
    facility: 'Central Blood Bank',
    hemoglobinBefore: 14.2,
    hemoglobinAfter: 13.8,
    bp: '120/80',
    pulse: 72,
    notes: 'Successful donation with no complications',
  },
  {
    id: 2,
    date: '2023-08-02',
    type: 'Whole Blood',
    volume: 450, // mL
    facility: 'City Hospital Blood Center',
    hemoglobinBefore: 13.8,
    hemoglobinAfter: 13.5,
    bp: '118/78',
    pulse: 70,
    notes: 'Slight dizziness after donation, recommended to rest for 15 minutes',
  },
  {
    id: 3,
    date: '2023-05-05',
    type: 'Platelets',
    volume: 200, // mL
    facility: 'Central Blood Bank',
    hemoglobinBefore: 14.0,
    hemoglobinAfter: 13.8,
    bp: '122/82',
    pulse: 74,
    notes: 'First time platelet donation, patient handled procedure well',
  },
  {
    id: 4,
    date: '2023-02-10',
    type: 'Whole Blood',
    volume: 450, // mL
    facility: 'Mobile Blood Drive - City Hall',
    hemoglobinBefore: 13.5,
    hemoglobinAfter: 13.2,
    bp: '125/85',
    pulse: 76,
    notes: 'Donation completed successfully, recommended iron supplements',
  },
  {
    id: 5,
    date: '2022-11-15',
    type: 'Whole Blood',
    volume: 450, // mL
    facility: 'Central Blood Bank',
    hemoglobinBefore: 13.9,
    hemoglobinAfter: 13.6,
    bp: '121/81',
    pulse: 72,
    notes: 'Routine donation, no issues',
  },
];

export default function HealthReportsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState([dayjs().subtract(1, 'year'), dayjs()]);
  const [healthMetric, setHealthMetric] = useState('hemoglobin');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'green';
      case 'warning':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return <CheckCircleOutlined />;
      case 'warning':
        return <WarningOutlined />;
      case 'critical':
        return <ExclamationCircleFilled />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'orange' };
    if (bmi >= 18.5 && bmi < 25) return { text: 'Normal', color: 'green' };
    if (bmi >= 25 && bmi < 30) return { text: 'Overweight', color: 'orange' };
    return { text: 'Obese', color: 'red' };
  };

  const bmiStatus = getBMIStatus(mockHealthData.bmi.value);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => dayjs(text).format('MMM D, YYYY'),
      sorter: (a: any, b: any) => dayjs(b.date).unix() - dayjs(a.date).unix(),
    },
    {
      title: 'Donation Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => (
        <Tag color={text === 'Whole Blood' ? 'red' : 'orange'}>{text}</Tag>
      ),
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      render: (text: number) => `${text} mL`,
    },
    {
      title: 'Facility',
      dataIndex: 'facility',
      key: 'facility',
    },
    {
      title: 'Vital Signs',
      key: 'vitals',
      render: (text: string, record: any) => (
        <div>
          <div>BP: {record.bp}</div>
          <div>Pulse: {record.pulse} bpm</div>
          <div className="text-xs text-gray-500">
            Hemoglobin: {record.hemoglobinBefore} g/dL → {record.hemoglobinAfter} g/dL
          </div>
        </div>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

  // Định nghĩa items cho Tabs component
  const tabItems = [
    {
      key: 'dashboard',
      label: <span><DashboardOutlined /> Health Dashboard</span>,
      children: (
        <>
          {/* Health overview section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>Health Overview</Title>
              <Space>
                <Text>Last checkup: </Text>
                <Tag color="blue">{dayjs(mockHealthData.lastCheckupDate).format('MMM D, YYYY')}</Tag>
              </Space>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card className="text-center h-full">
                  <HeartOutlined className="text-3xl text-red-500 mb-2" />
                  <Statistic 
                    title="Blood Pressure" 
                    value={`${mockHealthData.bloodPressure.systolic}/${mockHealthData.bloodPressure.diastolic}`} 
                    suffix="mmHg" 
                    valueStyle={{ color: getStatusColor(mockHealthData.bloodPressure.status) }}
                  />
                  <Tag 
                    icon={getStatusIcon(mockHealthData.bloodPressure.status)} 
                    color={getStatusColor(mockHealthData.bloodPressure.status)}
                  >
                    {mockHealthData.bloodPressure.status.charAt(0).toUpperCase() + mockHealthData.bloodPressure.status.slice(1)}
                  </Tag>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card className="text-center h-full">
                  <MedicineBoxOutlined className="text-3xl text-blue-500 mb-2" />
                  <Statistic 
                    title="Hemoglobin" 
                    value={mockHealthData.hemoglobin.value} 
                    suffix="g/dL" 
                    valueStyle={{ color: getStatusColor(mockHealthData.hemoglobin.status) }}
                    precision={1}
                  />
                  <Tag 
                    icon={getStatusIcon(mockHealthData.hemoglobin.status)} 
                    color={getStatusColor(mockHealthData.hemoglobin.status)}
                  >
                    {mockHealthData.hemoglobin.status.charAt(0).toUpperCase() + mockHealthData.hemoglobin.status.slice(1)}
                  </Tag>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card className="text-center h-full">
                  <AreaChartOutlined className="text-3xl text-purple-500 mb-2" />
                  <Statistic 
                    title="Iron Level" 
                    value={mockHealthData.ironLevel.value} 
                    suffix="μg/dL" 
                    valueStyle={{ color: getStatusColor(mockHealthData.ironLevel.status) }}
                  />
                  <Tag 
                    icon={getStatusIcon(mockHealthData.ironLevel.status)} 
                    color={getStatusColor(mockHealthData.ironLevel.status)}
                  >
                    {mockHealthData.ironLevel.status.charAt(0).toUpperCase() + mockHealthData.ironLevel.status.slice(1)}
                  </Tag>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card className="text-center h-full">
                  <BarChartOutlined className="text-3xl text-orange-500 mb-2" />
                  <Statistic 
                    title="Platelets" 
                    value={mockHealthData.platelets.value} 
                    suffix="thousand/μL" 
                    valueStyle={{ color: getStatusColor(mockHealthData.platelets.status) }}
                  />
                  <Tag 
                    icon={getStatusIcon(mockHealthData.platelets.status)} 
                    color={getStatusColor(mockHealthData.platelets.status)}
                  >
                    {mockHealthData.platelets.status.charAt(0).toUpperCase() + mockHealthData.platelets.status.slice(1)}
                  </Tag>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Donation eligibility */}
          <div className="mb-8">
            <Card className={mockHealthData.donationEligibility.eligible ? 'bg-green-50' : 'bg-red-50'}>
              <Row gutter={16} align="middle">
                <Col xs={24} md={16}>
                  <Title level={4}>
                    {mockHealthData.donationEligibility.eligible ? 
                      <CheckCircleOutlined className="text-green-500 mr-2" /> : 
                      <WarningOutlined className="text-red-500 mr-2" />
                    }
                    Donation Eligibility Status
                  </Title>
                  <Paragraph>
                    {mockHealthData.donationEligibility.eligible ? 
                      'You are currently eligible to donate blood. Schedule your next donation when ready.' : 
                      `You are not currently eligible to donate. Reason: ${mockHealthData.donationEligibility.reason}.`
                    }
                  </Paragraph>
                  {!mockHealthData.donationEligibility.eligible && mockHealthData.donationEligibility.nextEligibleDate && (
                    <Paragraph>
                      You will be eligible to donate again on <strong>{dayjs(mockHealthData.donationEligibility.nextEligibleDate).format('MMMM D, YYYY')}</strong>.
                    </Paragraph>
                  )}
                </Col>
                <Col xs={24} md={8} className="text-center">
                  {mockHealthData.donationEligibility.eligible ? (
                    <Button 
                      type="primary" 
                      size="large" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => router.push('/member/appointments')}
                    >
                      Schedule Donation
                    </Button>
                  ) : (
                    <Statistic 
                      title="Next Eligible Date" 
                      value={dayjs(mockHealthData.donationEligibility.nextEligibleDate).format('MMM D, YYYY')} 
                      suffix={`(${dayjs(mockHealthData.donationEligibility.nextEligibleDate).diff(dayjs(), 'day')} days)`}
                    />
                  )}
                </Col>
              </Row>
            </Card>
          </div>

          {/* Health trends and BMI */}
          <div className="mb-8">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={16}>
                <Card title="Health Trends">
                  <div className="mb-4">
                    <Space>
                      <Text>Metric:</Text>
                      <Select 
                        value={healthMetric} 
                        onChange={setHealthMetric}
                        style={{ width: 150 }}
                      >
                        <Option value="hemoglobin">Hemoglobin</Option>
                        <Option value="bloodPressure">Blood Pressure</Option>
                        <Option value="ironLevel">Iron Level</Option>
                        <Option value="platelets">Platelets</Option>
                        <Option value="weight">Weight</Option>
                      </Select>
                      <Text>Period:</Text>
                      <RangePicker 
                        value={dateRange as [Dayjs, Dayjs]} 
                        onChange={(dates) => setDateRange(dates as any)}
                      />
                    </Space>
                  </div>
                  
                  <div className="h-64 flex items-center justify-center bg-gray-100">
                    <Text className="text-gray-500">Health trend chart would be displayed here</Text>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card title="Body Metrics" className="h-full">
                  <div className="text-center mb-4">
                    <Statistic 
                      title="Weight" 
                      value={mockHealthData.weight.value} 
                      suffix="kg" 
                      precision={1}
                    />
                  </div>
                  
                  <div className="text-center mb-4">
                    <Statistic 
                      title="BMI" 
                      value={mockHealthData.bmi.value} 
                      precision={1}
                      valueStyle={{ color: bmiStatus.color }}
                    />
                    <Tag color={bmiStatus.color}>{bmiStatus.text}</Tag>
                  </div>
                  
                  <Divider />
                  
                  <Title level={5}>Next Check-up</Title>
                  <div className="text-center">
                    <Text>{dayjs(mockHealthData.nextRecommendedCheckup).format('MMMM D, YYYY')}</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Recovery tips */}
          <div>
            <Card title="Post-Donation Recovery Tips" className="bg-blue-50">
              <Row gutter={[16, 16]}>
                {mockHealthData.recoveryTips.map((tip, index) => (
                  <Col xs={24} md={12} key={index}>
                    <div className="flex items-start">
                      <CheckCircleOutlined className="text-green-500 mr-2 mt-1" />
                      <Text>{tip}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        </>
      )
    },
    
    {
      key: 'history',
      label: <span><HistoryOutlined /> Donation History</span>,
      children: (
        <>
          <div className="mb-4 flex justify-between items-center">
            <Title level={4}>Donation Health Records</Title>
            <RangePicker 
              value={dateRange as [Dayjs, Dayjs]} 
              onChange={(dates) => setDateRange(dates as any)}
            />
          </div>
          
          <Table 
            dataSource={mockDonationData} 
            columns={columns} 
            rowKey="id" 
            pagination={false}
            className="mb-6"
          />
          
          <div className="mt-8">
            <Card title="Health Metrics Across Donations">
              <div className="h-64 flex items-center justify-center bg-gray-100">
                <Text className="text-gray-500">Donation history chart would be displayed here</Text>
              </div>
            </Card>
          </div>
        </>
      )
    },
    
    {
      key: 'notes',
      label: <span><FileTextOutlined /> Medical Notes</span>,
      children: (
        <>
          <Title level={4}>Medical Notes & Recommendations</Title>
          
          {mockHealthData.medicalNotes.length > 0 ? (
            <div className="space-y-4">
              {mockHealthData.medicalNotes.map((note, index) => (
                <Card key={index} className="shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Text strong>{note.doctor}</Text>
                      <Text className="text-gray-500 ml-2">
                        {dayjs(note.date).format('MMMM D, YYYY')}
                      </Text>
                    </div>
                    <Tag color="blue">Medical Note</Tag>
                  </div>
                  <Paragraph>{note.notes}</Paragraph>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="No medical notes available" />
          )}
          
          <Divider />
          
          <Title level={4}>Health Recommendations</Title>
          <Alert
            message="Personalized Health Recommendations"
            description={
              <div className="space-y-2 mt-2">
                <Paragraph>
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  Maintain your current iron intake to keep hemoglobin levels optimal for donations.
                </Paragraph>
                <Paragraph>
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  Consider scheduling your next health check-up before your next donation to ensure all metrics remain in healthy ranges.
                </Paragraph>
                <Paragraph>
                  <InfoCircleOutlined className="text-blue-500 mr-2" />
                  Your blood pressure has been slightly elevated in recent check-ups. Consider monitoring this between donations.
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
            className="mb-6"
          />
          
          <Card title="Health Resources" className="bg-blue-50">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card className="h-full">
                  <Title level={5}>Nutrition for Blood Donors</Title>
                  <Paragraph>
                    Learn about the best foods to eat before and after donation to maintain optimal iron levels and overall health.
                  </Paragraph>
                  <Button type="link">Read More</Button>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="h-full">
                  <Title level={5}>Post-Donation Care</Title>
                  <Paragraph>
                    Important tips to help your body recover quickly after blood donation and prevent side effects.
                  </Paragraph>
                  <Button type="link">Read More</Button>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="h-full">
                  <Title level={5}>Long-term Donor Health</Title>
                  <Paragraph>
                    Guidelines for maintaining your health as a regular blood donor over many years.
                  </Paragraph>
                  <Button type="link">Read More</Button>
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      )
    },
    
    {
      key: 'analytics',
      label: <span><PieChartOutlined /> Analytics</span>,
      children: (
        <>
          <Title level={4}>Health Analytics</Title>
          
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card title="Donation Frequency">
                <div className="h-64 flex items-center justify-center bg-gray-100">
                  <Text className="text-gray-500">Donation frequency chart would be displayed here</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Health Metrics Correlation">
                <div className="h-64 flex items-center justify-center bg-gray-100">
                  <Text className="text-gray-500">Health metrics correlation chart would be displayed here</Text>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <RiseOutlined className="text-4xl text-green-500 mb-2" />
                <Statistic 
                  title="Recovery Rate" 
                  value={95} 
                  suffix="%" 
                />
                <Text className="text-gray-500">Based on hemoglobin recovery between donations</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <HeartOutlined className="text-4xl text-red-500 mb-2" />
                <Statistic 
                  title="Blood Pressure Stability" 
                  value={92} 
                  suffix="%" 
                />
                <Text className="text-gray-500">Consistency of readings over time</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <MedicineBoxOutlined className="text-4xl text-blue-500 mb-2" />
                <Statistic 
                  title="Overall Health Score" 
                  value={88} 
                  suffix="/100" 
                />
                <Text className="text-gray-500">Based on all health metrics</Text>
              </Card>
            </Col>
          </Row>
        </>
      )
    }
  ];

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
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <Title level={2}>
            <LineChartOutlined className="mr-2" />
            Health Reports
          </Title>
          <Paragraph className="text-gray-500">
            Track and monitor your health metrics related to blood donation
          </Paragraph>
        </div>

        <Card className="shadow-md">
          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => setActiveTab(key)}
            items={tabItems}
            tabBarExtraContent={
              <Space>
                <Button icon={<DownloadOutlined />}>Export</Button>
                <Button icon={<PrinterOutlined />}>Print</Button>
              </Space>
            }
          />
        </Card>
      </div>
    </div>
  );
} 