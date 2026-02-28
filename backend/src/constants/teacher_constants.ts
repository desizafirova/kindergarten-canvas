/**
 * Shared constants for Teacher entity operations
 */

/**
 * Standard field selection for Teacher queries
 * Used across all teacher services to maintain consistency
 */
export const TEACHER_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    position: true,
    bio: true,
    photoUrl: true,
    status: true,
    displayOrder: true,
    createdAt: true,
    updatedAt: true,
} as const;
