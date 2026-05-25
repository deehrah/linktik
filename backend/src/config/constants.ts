/**
 * Application-wide constants
 * Centralized configuration to avoid magic numbers and strings scattered throughout the codebase
 */

// Cache TTL values in seconds
export const CACHE_TTL = {
  LINK: 86400, // 24 hours
  SESSION: 3600, // 1 hour
  QR_CODE: 604800, // 7 days
  USER_PROFILE: 3600, // 1 hour
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  API: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
  REDIRECT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 1000,
  },
} as const;

// Reserved slugs that cannot be used as short codes
export const RESERVED_SLUGS = [
  'api',
  'admin',
  'dashboard',
  'login',
  'signup',
  'logout',
  'events',
  'tickets',
  'qr',
  'links',
  'analytics',
  'settings',
  'help',
  'support',
  'pricing',
  'about',
  'contact',
  'terms',
  'privacy',
  'blog',
  'docs',
  'status',
  'health',
  'redirect',
  'shorten',
  'create',
  'delete',
  'update',
] as const;

// NanoID configuration for short code generation
export const NANOID_CONFIG = {
  ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  SHORT_CODE_LENGTH: 6,
  FALLBACK_LENGTH: 8,
  MAX_COLLISION_ATTEMPTS: 5,
} as const;

// Analytics configuration
export const ANALYTICS_CONFIG = {
  DEFAULT_PERIOD_DAYS: 30,
  TOP_COUNTRIES_LIMIT: 10,
  TOP_BROWSERS_LIMIT: 5,
  TOP_DEVICES_LIMIT: 5,
  CLICK_BATCH_SIZE: 10, // Batch write to DB after N clicks
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Link constraints
export const LINK_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  CUSTOM_SLUG_MIN_LENGTH: 3,
  CUSTOM_SLUG_MAX_LENGTH: 50,
} as const;

// Plan tier limits
export const PLAN_FEATURES = {
  FREE: {
    CUSTOM_CODES_ALLOWED: false,
    ANALYTICS_RETENTION_DAYS: 7,
    API_CALLS_PER_DAY: 100,
    QR_CODES_PER_MONTH: 10,
  },
  PRO: {
    CUSTOM_CODES_ALLOWED: true,
    ANALYTICS_RETENTION_DAYS: 90,
    API_CALLS_PER_DAY: 10000,
    QR_CODES_PER_MONTH: 100,
  },
  ENTERPRISE: {
    CUSTOM_CODES_ALLOWED: true,
    ANALYTICS_RETENTION_DAYS: 365,
    API_CALLS_PER_DAY: 1000000,
    QR_CODES_PER_MONTH: 0,
  },
} as const;

// Error codes for consistent error handling
export const ERROR_CODES = {
  LINK_NOT_FOUND: 'LINK_NOT_FOUND',
  LINK_EXPIRED: 'LINK_EXPIRED',
  LINK_INACTIVE: 'LINK_INACTIVE',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  SLUG_EXISTS: 'SLUG_EXISTS',
  PLAN_RESTRICTION: 'PLAN_RESTRICTION',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
} as const;
