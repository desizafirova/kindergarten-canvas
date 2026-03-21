/**
 * Job-related type definitions for frontend.
 * Matches backend Prisma schema for Job model.
 */

export type JobStatus = 'DRAFT' | 'PUBLISHED';

export interface Job {
  id: number;
  title: string;
  /** Rich text HTML from TipTap — REQUIRED */
  description: string;
  /** Rich text HTML from TipTap — optional */
  requirements: string | null;
  /** Required email */
  contactEmail: string;
  /** ISO 8601, optional */
  applicationDeadline: string | null;
  /** default true; controls if accepting applications */
  isActive: boolean;
  status: JobStatus;
  /** Set by backend on publish */
  publishedAt: string | null;
  /** ISO 8601 date string from API */
  createdAt: string;
  /** ISO 8601 date string from API */
  updatedAt: string;
}
