// Shared types between frontend and backend
// This file will be populated as we build features

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

// Placeholder - actual types will be added in subsequent stories
export {};
