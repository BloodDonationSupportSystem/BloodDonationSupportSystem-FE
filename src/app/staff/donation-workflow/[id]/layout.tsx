import React from 'react';
import StaffLayout from '@/components/Layout/StaffLayout';

export default function DonationWorkflowLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StaffLayout
            title="Donation Workflow"
            breadcrumbItems={[
                { title: 'Donation Events', href: '/staff/donation-events' },
                { title: 'Donation Workflow' }
            ]}
        >
            <div className="px-4 py-6">
                {children}
            </div>
        </StaffLayout>
    );
} 