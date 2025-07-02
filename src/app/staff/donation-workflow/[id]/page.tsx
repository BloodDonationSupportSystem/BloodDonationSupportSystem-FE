import React from 'react';
import DonationWorkflowClient from './DonationWorkflowClient';

export default function DonationWorkflowPage({ params }: { params: { id: string } }) {
    // Use React.use() to unwrap the params object in a Server Component
    const eventId = React.use(Promise.resolve(params.id));

    return <DonationWorkflowClient eventId={eventId} />;
} 