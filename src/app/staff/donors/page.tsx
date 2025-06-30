'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, Select, Input, Card, Badge } from 'antd';
import { SearchOutlined, UserOutlined, HistoryOutlined, HeartOutlined } from '@ant-design/icons';
import StaffLayout from '@/components/Layout/StaffLayout';

const { Option } = Select;

export default function StaffDonorsPage() {
  // Mock data for donors
  const donors = [
    {
      id: 'D001',
      name: 'John Doe',
      bloodType: 'A+',
      lastDonation: '2023-05-15',
      nextEligible: '2023-07-15',
      donationCount: 5,
      status: 'Eligible',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
    },
    {
      id: 'D002',
      name: 'Jane Smith',
      bloodType: 'O-',
      lastDonation: '2023-04-20',
      nextEligible: '2023-06-20',
      donationCount: 8,
      status: 'Eligible',
      email: 'jane.smith@example.com',
      phone: '555-234-5678',
    },
    {
      id: 'D003',
      name: 'Bob Johnson',
      bloodType: 'B+',
      lastDonation: '2023-06-01',
      nextEligible: '2023-08-01',
      donationCount: 3,
      status: 'Ineligible',
      email: 'bob.johnson@example.com',
      phone: '555-345-6789',
    },
    {
      id: 'D004',
      name: 'Alice Williams',
      bloodType: 'AB+',
      lastDonation: '2022-12-15',
      nextEligible: '2023-02-15',
      donationCount: 12,
      status: 'Eligible',
      email: 'alice.williams@example.com',
      phone: '555-456-7890',
    },
    {
      id: 'D005',
      name: 'Charlie Brown',
      bloodType: 'A-',
      lastDonation: '2023-05-30',
      nextEligible: '2023-07-30',
      donationCount: 7,
      status: 'Ineligible',
      email: 'charlie.brown@example.com',
      phone: '555-567-8901',
    },
    {
      id: 'D006',
      name: 'David Miller',
      bloodType: 'O+',
      lastDonation: '2023-03-10',
      nextEligible: '2023-05-10',
      donationCount: 4,
      status: 'Eligible',
      email: 'david.miller@example.com',
      phone: '555-678-9012',
    },
  ];

  const [filteredInfo, setFilteredInfo] = useState<any>({});
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const handleChange = (pagination: any, filters: any, sorter: any) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const columns = [
    {
      title: 'Donor ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: any, b: any) => a.id.localeCompare(b.id),
      sortOrder: sortedInfo.columnKey === 'id' && sortedInfo.order,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    },
    {
      title: 'Blood Type',
      dataIndex: 'bloodType',
      key: 'bloodType',
      filters: [
        { text: 'A+', value: 'A+' },
        { text: 'A-', value: 'A-' },
        { text: 'B+', value: 'B+' },
        { text: 'B-', value: 'B-' },
        { text: 'AB+', value: 'AB+' },
        { text: 'AB-', value: 'AB-' },
        { text: 'O+', value: 'O+' },
        { text: 'O-', value: 'O-' },
      ],
      filteredValue: filteredInfo.bloodType || null,
      onFilter: (value: any, record: any) => record.bloodType === value,
      render: (bloodType: string) => (
        <Tag color="red">{bloodType}</Tag>
      ),
    },
    {
      title: 'Last Donation',
      dataIndex: 'lastDonation',
      key: 'lastDonation',
      sorter: (a: any, b: any) => new Date(a.lastDonation).getTime() - new Date(b.lastDonation).getTime(),
      sortOrder: sortedInfo.columnKey === 'lastDonation' && sortedInfo.order,
    },
    {
      title: 'Next Eligible',
      dataIndex: 'nextEligible',
      key: 'nextEligible',
      sorter: (a: any, b: any) => new Date(a.nextEligible).getTime() - new Date(b.nextEligible).getTime(),
      sortOrder: sortedInfo.columnKey === 'nextEligible' && sortedInfo.order,
    },
    {
      title: 'Donations',
      dataIndex: 'donationCount',
      key: 'donationCount',
      sorter: (a: any, b: any) => a.donationCount - b.donationCount,
      sortOrder: sortedInfo.columnKey === 'donationCount' && sortedInfo.order,
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Eligible', value: 'Eligible' },
        { text: 'Ineligible', value: 'Ineligible' },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => {
        let color = status === 'Eligible' ? 'green' : 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: any) => (
        <Space size="small">
          <Button type="primary" size="small" icon={<UserOutlined />}>
            Profile
          </Button>
          <Button size="small" icon={<HistoryOutlined />}>
            History
          </Button>
          {record.status === 'Eligible' && (
            <Button type="default" size="small" icon={<HeartOutlined />}>
              Schedule
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <StaffLayout title="Donors" breadcrumbItems={[{ title: 'Donors' }]}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Manage Donors</h2>
            <p className="text-gray-500">View and manage all registered donors</p>
          </div>
        </div>

        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
              <Select placeholder="Filter by blood type" style={{ width: 150 }} allowClear>
                <Option value="A+">A+</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B-">B-</Option>
                <Option value="AB+">AB+</Option>
                <Option value="AB-">AB-</Option>
                <Option value="O+">O+</Option>
                <Option value="O-">O-</Option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select placeholder="Filter by status" style={{ width: 150 }} allowClear>
                <Option value="Eligible">Eligible</Option>
                <Option value="Ineligible">Ineligible</Option>
              </Select>
            </div>
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input placeholder="Search by name or donor ID" prefix={<SearchOutlined />} />
            </div>
            <div className="self-end">
              <Button onClick={clearAll}>Clear Filters</Button>
            </div>
          </div>
        </Card>

        <Table
          columns={columns}
          dataSource={donors}
          rowKey="id"
          onChange={handleChange}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </StaffLayout>
  );
} 