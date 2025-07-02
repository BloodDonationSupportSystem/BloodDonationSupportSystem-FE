import React, { useEffect, useRef } from 'react';
import { Modal, Table, Tag, Empty, Spin, message } from 'antd';
import { useDonorAppointmentHistory } from '@/hooks/api/useDonationAppointment';
import { DonationAppointment, AppointmentHistoryQueryParams } from '@/services/api/donationAppointmentService';
import dayjs from 'dayjs';

interface DonorAppointmentHistoryProps {
    visible: boolean;
    onClose: () => void;
    donorId: string;
    donorName?: string;
}

const DonorAppointmentHistory: React.FC<DonorAppointmentHistoryProps> = ({
    visible,
    onClose,
    donorId,
    donorName,
}) => {
    const loadedDonorRef = useRef<string | null>(null);
    const hasLoadedRef = useRef(false);

    const {
        appointments,
        isLoading,
        error,
        pagination,
        fetchAppointmentHistory
    } = useDonorAppointmentHistory({
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'createdTime',
        sortDirection: 'desc'
    });

    useEffect(() => {
        if (visible && donorId && (!hasLoadedRef.current || loadedDonorRef.current !== donorId)) {
            loadedDonorRef.current = donorId;
            hasLoadedRef.current = true;
            fetchAppointmentHistory(donorId);
        }

        if (!visible) {
            hasLoadedRef.current = false;
        }
    }, [visible, donorId, fetchAppointmentHistory]);

    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        const params: AppointmentHistoryQueryParams = {
            pageNumber: pagination.current,
            pageSize: pagination.pageSize,
        };

        if (sorter.field && sorter.order) {
            params.sortBy = sorter.field;
            params.sortDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
        }

        fetchAppointmentHistory(donorId, params);
    };

    const formatDate = (dateString?: string) => {
        return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '-';
    };

    const formatDateTime = (dateString?: string) => {
        return dateString ? dayjs(dateString).format('YYYY-MM-DD HH:mm') : '-';
    };

    const getStatusTag = (status: string) => {
        let color = 'default';

        switch (status.toLowerCase()) {
            case 'pending':
                color = 'processing';
                break;
            case 'approved':
                color = 'success';
                break;
            case 'completed':
                color = 'green';
                break;
            case 'cancelled':
                color = 'red';
                break;
            case 'rejected':
                color = 'error';
                break;
            case 'scheduled':
                color = 'blue';
                break;
            case 'confirmed':
                color = 'cyan';
                break;
            case 'expired':
                color = 'warning';
                break;
            default:
                color = 'default';
        }

        return <Tag color={color}>{status}</Tag>;
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'preferredDate',
            key: 'preferredDate',
            render: (text: string, record: DonationAppointment) => {
                return record.confirmedDate
                    ? formatDate(record.confirmedDate)
                    : formatDate(record.preferredDate);
            },
            sorter: true,
        },
        {
            title: 'Time Slot',
            dataIndex: 'preferredTimeSlot',
            key: 'preferredTimeSlot',
            render: (text: string, record: DonationAppointment) => {
                return record.confirmedTimeSlot || record.preferredTimeSlot || '-';
            },
        },
        {
            title: 'Location',
            dataIndex: 'locationName',
            key: 'locationName',
            render: (text: string, record: DonationAppointment) => {
                return record.confirmedLocationName || record.locationName || '-';
            },
        },
        {
            title: 'Blood Component',
            dataIndex: 'componentTypeName',
            key: 'componentTypeName',
            render: (text: string) => text || 'Whole Blood',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Approved', value: 'Approved' },
                { text: 'Completed', value: 'Completed' },
                { text: 'Cancelled', value: 'Cancelled' },
                { text: 'Rejected', value: 'Rejected' },
                { text: 'Scheduled', value: 'Scheduled' },
                { text: 'Confirmed', value: 'Confirmed' },
                { text: 'Expired', value: 'Expired' },
            ],
        },
        {
            title: 'Created',
            dataIndex: 'createdTime',
            key: 'createdTime',
            render: (date: string) => formatDateTime(date),
            sorter: true,
        },
        {
            title: 'Completed',
            dataIndex: 'completedTime',
            key: 'completedTime',
            render: (date: string) => formatDateTime(date),
            sorter: true,
        },
    ];

    return (
        <Modal
            title={`Donation History - ${donorName || 'Donor'}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
        >
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Spin size="large" />
                </div>
            ) : appointments.length === 0 ? (
                <Empty description="No donation history found" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={appointments}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                    }}
                    onChange={handleTableChange}
                />
            )}
        </Modal>
    );
};

export default DonorAppointmentHistory; 