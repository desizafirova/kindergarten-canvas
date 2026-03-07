/**
 * Teacher-related type definitions for frontend.
 * Matches backend Prisma schema for Teacher model.
 */

export enum TeacherStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number;
  status: TeacherStatus;
  /** ISO 8601 date string from API */
  createdAt: string;
  /** ISO 8601 date string from API */
  updatedAt: string;
}
