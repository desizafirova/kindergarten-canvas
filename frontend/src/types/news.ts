/**
 * News-related type definitions for frontend.
 * Matches backend Prisma schema for NewsItem.
 */

export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  status: NewsStatus;
  /** ISO 8601 date string from API (e.g., "2024-03-15T10:30:00Z") */
  publishedAt: string | null;
  /** ISO 8601 date string from API */
  createdAt: string;
  /** ISO 8601 date string from API */
  updatedAt: string;
}
