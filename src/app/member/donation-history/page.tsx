'use client';

import React, { useState } from 'react';
import { 
  Typography, Table, Tag, Card, Row, Col, Button, Space, Spin, Alert, 
  DatePicker, Select, Input, Form, Divider, Empty, App, Statistic
} from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useDonationEvents } from '@/hooks/api/useDonationEvents';
import { DonationEventsParams } from '@/services/api/donationEventService';
import { 
  SearchOutlined, FilterOutlined, CalendarOutlined, FileTextOutlined, 
  HeartOutlined, HistoryOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function DonationHistoryPage() {
  const { user } = useAuth();
  const [filterForm] = Form.useForm();
  const [filters, setFilters] = useState<DonationEventsParams>({});
  const { events, isLoading, error, pagination, refetch } = useDonationEvents();

  // Format date to display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('MMMM D, YYYY, h:mm A');
  };

  // Get status tag color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'completed' || statusLower === 'successful') return 'green';
    if (statusLower === 'scheduled' || statusLower === 'pending') return 'blue';
    if (statusLower === 'cancelled' || statusLower === 'rejected') return 'red';
    if (statusLower === 'in progress' || statusLower === 'processing') return 'orange';
    
    return 'default';
  };

  // Handle filter submit
  const handleFilterSubmit = (values: any) => {
    const dateRange = values.dateRange;
    
    const params: DonationEventsParams = {
      status: values.status || undefined,
      startDate: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
      endDate: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
      pageNumber: 1, // Reset to first page when applying new filters
      pageSize: pagination.pageSize,
      sortBy: values.sortBy || 'createdTime',
      sortAscending: values.sortOrder === 'asc'
    };
    
    setFilters(params);
    refetch(params);
  };

  // Handle pagination change
  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    const params: DonationEventsParams = {
      ...filters,
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: sorter.field || 'createdTime',
      sortAscending: sorter.order === 'ascend'
    };
    
    refetch(params);
  };

  // Reset filters
  const handleReset = () => {
    filterForm.resetFields();
    setFilters({});
    refetch({
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'createdTime',
      sortAscending: false
    });
  };

  // Table columns
  const columns = [
    {
      title: 'Donation Date',
      dataIndex: 'collectedAt',
      key: 'collectedAt',
      render: (date: string) => formatDate(date),
      sorter: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Blood Group',
      dataIndex: 'bloodGroupName',
      key: 'bloodGroupName',
      render: (bloodGroup: string) => (
        <Tag color="red">{bloodGroup}</Tag>
      )
    },
    {
      title: 'Component Type',
      dataIndex: 'componentTypeName',
      key: 'componentTypeName'
    },
    {
      title: 'Quantity (Units)',
      dataIndex: 'quantityUnits',
      key: 'quantityUnits',
      render: (quantity: number) => <Text strong>{quantity}</Text>,
      sorter: true
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      key: 'locationName'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" type="primary" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <App>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={2}>Donation History</Title>
            <Paragraph className="text-gray-500 mb-0">
              View your blood donation records and status
            </Paragraph>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              type="default" 
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={8}>
          <Card variant="outlined" className="h-full">
            <Statistic
              title="Total Donations"
              value={events.length}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="outlined" className="h-full">
            <Statistic
              title="Latest Donation"
              value={events.length > 0 ? formatDate(events[0]?.collectedAt).split(',')[0] : 'No donations yet'}
              prefix={<CalendarOutlined />}
              valueStyle={{ fontSize: '16px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card variant="outlined" className="h-full">
            <Statistic
              title="Total Blood Units"
              value={events.reduce((total, event) => total + event.quantityUnits, 0)}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Card */}
      <Card variant="outlined" className="mb-6">
        <Title level={5}>
          <FilterOutlined className="mr-2" />
          Filter Donations
        </Title>
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={handleFilterSubmit}
          initialValues={{
            sortBy: 'createdTime',
            sortOrder: 'desc'
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Date Range" name="dateRange">
                <RangePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Status" name="status">
                <Select placeholder="All Statuses" allowClear>
                  <Option value="Completed">Completed</Option>
                  <Option value="Scheduled">Scheduled</Option>
                  <Option value="Cancelled">Cancelled</Option>
                  <Option value="Processing">Processing</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Sort By" name="sortBy">
                <Select>
                  <Option value="createdTime">Date</Option>
                  <Option value="status">Status</Option>
                  <Option value="quantityUnits">Quantity</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Order" name="sortOrder">
                <Select>
                  <Option value="desc">Newest First</Option>
                  <Option value="asc">Oldest First</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-2">
            <Button onClick={handleReset}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Apply Filters
            </Button>
          </div>
        </Form>
      </Card>

      {/* Data Table */}
      <Card variant="outlined" bodyStyle={{ padding: 0 }}>
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <Empty
              description="No donation records found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Paragraph className="text-gray-500 mt-4">
              You have no blood donation records yet. Once you donate blood, your records will appear here.
            </Paragraph>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={events.map(event => ({ ...event, key: event.id }))}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            onChange={handleTableChange}
            loading={isLoading}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </App>
  );
} 