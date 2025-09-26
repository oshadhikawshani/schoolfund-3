// Main utils index file - exports all utility functions

// Constants
export * from './constants.js';

// Calculations
export * from './calculations.js';

// Formatters
export * from './formatters.js';

// Validators
export * from './validators.js';

// Helpers
export * from './helpers.js';

// Re-export commonly used functions for convenience
export {
  // Calculations
  calculateProgress,
  calculateRemaining,
  calculateDaysRemaining,
  calculateDonorBadge,
  calculateDistance,
  
  // Formatters
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  formatFileSize,
  
  // Validators
  validateEmail,
  validatePassword,
  validateRequired,
  validateCurrency,
  
  // Helpers
  debounce,
  throttle,
  deepClone,
  isEmpty,
  storage,
  copyToClipboard,
  isMobile
} from './helpers.js';

// Default export with all utilities
import * as constants from './constants.js';
import * as calculations from './calculations.js';
import * as formatters from './formatters.js';
import * as validators from './validators.js';
import * as helpers from './helpers.js';

export default {
  constants,
  calculations,
  formatters,
  validators,
  helpers
};
