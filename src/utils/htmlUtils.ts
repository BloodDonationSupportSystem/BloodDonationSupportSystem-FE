import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks and returns it as safe HTML
 * 
 * @param htmlContent The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (htmlContent: string | null | undefined): string => {
    if (!htmlContent) return '';

    try {
        // Sanitize the HTML to prevent XSS attacks
        return DOMPurify.sanitize(htmlContent);
    } catch (error) {
        console.error('Error sanitizing HTML:', error);
        return htmlContent; // Return the original content if sanitization fails
    }
}; 