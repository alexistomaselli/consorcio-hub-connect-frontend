// API URLs
// Vite usa import.meta.env en lugar de process.env
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Timeouts
export const DEFAULT_TIMEOUT_MS = 8000;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Authentication
export const TOKEN_STORAGE_KEY = 'token';
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

// Roles
export const USER_ROLES = {
  USER: 'USER',
  OWNER: 'OWNER',
  BUILDING_ADMIN: 'BUILDING_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

// File upload limits
export const MAX_FILE_SIZE_MB = 10; // 10 MB
