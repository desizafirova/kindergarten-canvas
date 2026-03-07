/**
 * Event-related type definitions for frontend.
 * Matches backend Prisma schema for Event model.
 */

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  /** ISO 8601 date string, REQUIRED */
  eventDate: string;
  /** ISO 8601 date string, optional (multi-day events) */
  eventEndDate: string | null;
  location: string | null;
  isImportant: boolean;
  imageUrl: string | null;
  status: EventStatus;
  /** Set by backend on publish */
  publishedAt: string | null;
  /** ISO 8601 date string from API */
  createdAt: string;
  /** ISO 8601 date string from API */
  updatedAt: string;
}
