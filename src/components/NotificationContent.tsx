'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { Typography } from 'antd';

interface NotificationContentProps {
    htmlContent: string;
    className?: string;
}

/**
 * Component to safely render HTML notification content
 * Uses DOMPurify to sanitize the HTML content
 */
const NotificationContent: React.FC<NotificationContentProps> = ({ htmlContent, className = '' }) => {
    // Sanitize the HTML content
    const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
            'h3', 'h4', 'p', 'div', 'span', 'strong', 'b', 'i', 'em', 'a', 'ul', 'ol', 'li',
            'br', 'hr'
        ],
        ALLOWED_ATTR: ['style', 'href', 'target', 'class'],
    });

    // Parse and format the notification content
    const formatNotificationContent = () => {
        // Check if the content is HTML
        if (htmlContent.includes('<') && htmlContent.includes('>')) {
            return (
                <div
                    className={`notification-content ${className}`}
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
            );
        }

        // If it's plain text, just return it
        return <Typography.Text className={className}>{htmlContent}</Typography.Text>;
    };

    return formatNotificationContent();
};

export default NotificationContent; 