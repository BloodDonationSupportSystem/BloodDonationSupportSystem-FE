import { format, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @param formatStr Optional format string (default: 'MMM dd, yyyy HH:mm')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatStr = 'MMM dd, yyyy HH:mm'): string {
    try {
        const date = parseISO(dateString);
        return format(date, formatStr);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

/**
 * Format a date string to a date only format
 * @param dateString ISO date string
 * @returns Formatted date string (date only)
 */
export function formatDateOnly(dateString: string): string {
    return formatDate(dateString, 'MMM dd, yyyy');
}

/**
 * Format a date string to a time only format
 * @param dateString ISO date string
 * @returns Formatted time string
 */
export function formatTimeOnly(dateString: string): string {
    return formatDate(dateString, 'HH:mm');
}

/**
 * Get relative time from now (e.g., "2 hours ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
    try {
        const date = parseISO(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
        }

        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    } catch (error) {
        console.error('Error getting relative time:', error);
        return dateString;
    }
} 