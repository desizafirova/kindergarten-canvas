/**
 * Shared constants for Deadline entity operations
 */
export const DEADLINE_SELECT = {
    id: true,
    title: true,
    description: true,
    deadlineDate: true,
    isUrgent: true,
    status: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
} as const;
