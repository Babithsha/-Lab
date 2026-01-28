/**
 * Format date and time for display
 */

export function formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function formatTime(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export function formatDateTime(dateString: string | Date): string {
    return `${formatDate(dateString)} • ${formatTime(dateString)}`;
}

export function formatDateTimeFull(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}
