import React from 'react';
import { sanitizeHtml } from '@/utils/htmlUtils';

interface HtmlContentProps {
    content: string | null | undefined;
    className?: string;
}

/**
 * A component that safely renders HTML content
 */
const HtmlContent: React.FC<HtmlContentProps> = ({ content, className = '' }) => {
    if (!content) return null;

    const sanitizedHtml = sanitizeHtml(content);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default HtmlContent; 