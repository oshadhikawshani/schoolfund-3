// Application Constants
// Centralized location for all magic numbers, thresholds, and configuration values

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_DELAY_MULTIPLIER: 2, // Exponential backoff
};

// Donor Badge Thresholds
export const BADGE_THRESHOLDS = {
  BRONZE: {
    MONETARY: 20000, // Rs. 20,000
    NON_MONETARY: 100, // 100 items
    NAME: 'Bronze',
    COLOR: 'amber'
  },
  SILVER: {
    MONETARY: 40000, // Rs. 40,000
    NON_MONETARY: 200, // 200 items
    NAME: 'Silver',
    COLOR: 'gray'
  },
  GOLD: {
    MONETARY: 80000, // Rs. 80,000
    NON_MONETARY: 400, // 400 items
    NAME: 'Gold',
    COLOR: 'yellow'
  }
};

// Campaign Status
export const CAMPAIGN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PRINCIPAL_PENDING: 'principal_pending',
  CLOSED: 'closed',
  COMPLETED: 'completed'
};

// Campaign Types
export const CAMPAIGN_TYPES = {
  MONETARY: 'Monetary',
  NON_MONETARY: 'Non-Monetary'
};

// Time Constants
export const TIME_CONSTANTS = {
  URGENT_DAYS: 7, // Campaigns with < 7 days are urgent
  MONTH_DAYS: 30, // Long-term campaigns > 30 days
  REFRESH_INTERVAL: 5000, // 5 seconds for auto-refresh
  DEBOUNCE_DELAY: 300, // 300ms for search debouncing
  ANIMATION_DURATION: 200, // 200ms for transitions
  NOTIFICATION_DURATION: 5000, // 5 seconds for notifications
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  DEFAULT_PAGE: 1
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILES: 5
};

// Form Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 254,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 1000,
  TITLE_MAX_LENGTH: 200
};

// Local Storage Keys
export const STORAGE_KEYS = {
  DONOR_TOKEN: 'donorToken',
  DONOR_DATA: 'donorData',
  DONOR_LOCATION: 'donorLocation',
  SCHOOL_TOKEN: 'schoolToken',
  SCHOOL_DATA: 'schoolData',
  PRINCIPAL_TOKEN: 'principalToken',
  PRINCIPAL_DATA: 'principalData',
  ADMIN_TOKEN: 'adminToken',
  THEME: 'theme',
  LANGUAGE: 'language',
  CACHED_CAMPAIGNS: 'cachedCampaigns',
  CACHED_STATS: 'cachedStats'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AUTH_ERROR: 'Authentication required. Please log in.',
  PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  OFFLINE_ERROR: 'You are offline. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid image or PDF.',
  TOO_MANY_FILES: 'Too many files. Maximum 5 files allowed.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful!',
  CAMPAIGN_CREATED: 'Campaign created successfully!',
  CAMPAIGN_UPDATED: 'Campaign updated successfully!',
  DONATION_SUCCESS: 'Donation completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  DATA_SAVED: 'Data saved successfully!'
};

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 320, // 80 * 4 (w-80)
  HEADER_HEIGHT: 64, // 16 * 4 (h-16)
  MOBILE_BREAKPOINT: 768, // md breakpoint
  TABLET_BREAKPOINT: 1024, // lg breakpoint
  DESKTOP_BREAKPOINT: 1280, // xl breakpoint
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080
  }
};

// Color Themes
export const THEME_COLORS = {
  PRIMARY: '#0091d9',
  PRIMARY_HOVER: '#036ca1',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  BACKGROUND: '#f9fafb',
  SURFACE: '#ffffff',
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6b7280',
  BORDER: '#e5e7eb'
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  NAME: /^[a-zA-Z\s]{2,100}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/
};

// Default Values
export const DEFAULT_VALUES = {
  CURRENCY: 'LKR',
  CURRENCY_SYMBOL: 'Rs.',
  DATE_FORMAT: 'en-US',
  TIMEZONE: 'Asia/Colombo',
  LANGUAGE: 'en',
  THEME: 'light',
  PAGE_SIZE: 12,
  SORT_ORDER: 'desc',
  SORT_FIELD: 'createdAt'
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_CACHING: true,
  ENABLE_RETRY_LOGIC: true,
  ENABLE_SKELETON_LOADING: true,
  ENABLE_ANIMATIONS: true
};

// Export all constants as a single object for easy access
export const CONSTANTS = {
  API_CONFIG,
  BADGE_THRESHOLDS,
  CAMPAIGN_STATUS,
  CAMPAIGN_TYPES,
  TIME_CONSTANTS,
  PAGINATION,
  FILE_UPLOAD,
  VALIDATION,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_CONSTANTS,
  THEME_COLORS,
  ANIMATION_DURATIONS,
  REGEX_PATTERNS,
  DEFAULT_VALUES,
  FEATURE_FLAGS
};

export default CONSTANTS;
