/**
 * Shared constants for Event entity operations
 */

/**
 * Standard field selection for Event queries
 * Used across all event services to maintain consistency
 */
export const EVENT_SELECT = {
    id: true,
    title: true,
    description: true,
    eventDate: true,
    eventEndDate: true,
    location: true,
    isImportant: true,
    imageUrl: true,
    status: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
} as const;
