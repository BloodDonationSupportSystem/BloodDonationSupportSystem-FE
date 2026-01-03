import React from 'react';
import DonationWorkflowClient from './DonationWorkflowClient';

export default async function DonationWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
    // Await the params object in Next.js 15
    const { id } = await params;

    return <DonationWorkflowClient eventId={id} />;
} 