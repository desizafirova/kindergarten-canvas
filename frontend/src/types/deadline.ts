/**
 * Deadline-related type definitions for frontend.
 * Matches backend Prisma schema for Deadline model.
 */

export type DeadlineStatus = 'DRAFT' | 'PUBLISHED';

export interface Deadline {
  id: number;
  title: string;
  description: string | null;
  /** ISO 8601 date string, REQUIRED */
  deadlineDate: string;
  isUrgent: boolean;
  status: DeadlineStatus;
  /** Set by backend on publish */
  publishedAt: string | null;
  /** ISO 8601 date string from API */
  createdAt: string;
  /** ISO 8601 date string from API */
  updatedAt: string;
}
