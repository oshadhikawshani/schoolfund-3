import { STORAGE_KEYS, DEFAULT_VALUES } from './constants.js';

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate unique ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Get nested object property safely
 * @param {object} obj - Object to access
 * @param {string} path - Property path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} Property value or default
 */
export const getNestedProperty = (obj, path, defaultValue = null) => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

/**
 * Set nested object property
 * @param {object} obj - Object to modify
 * @param {string} path - Property path
 * @param {any} value - Value to set
 * @returns {object} Modified object
 */
export const setNestedProperty = (obj, path, value) => {
  const keys = path.split('.');
  const result = deepClone(obj);
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
};

/**
 * Remove duplicates from array
 * @param {Array} array - Array to deduplicate
 * @param {string} key - Key to use for comparison (optional)
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = typeof item === 'object' ? item[key] : item;
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = getNestedProperty(a, key);
    const bVal = getNestedProperty(b, key);
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchKeys - Keys to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, searchKeys = []) => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  
  return array.filter(item => {
    if (searchKeys.length === 0) {
      // Search in all string properties
      return Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(term)
      );
    }
    
    // Search in specific keys
    return searchKeys.some(key => {
      const value = getNestedProperty(item, key);
      return typeof value === 'string' && value.toLowerCase().includes(term);
    });
  });
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Current page (1-based)
 * @param {number} pageSize - Items per page
 * @returns {object} Paginated result
 */
export const paginate = (array, page = 1, pageSize = DEFAULT_VALUES.PAGE_SIZE) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      pageSize,
      total: array.length,
      totalPages: Math.ceil(array.length / pageSize),
      hasNext: endIndex < array.length,
      hasPrev: page > 1
    }
  };
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

/**
 * Session storage helpers
 */
export const sessionStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to sessionStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Filename for download
 * @returns {Promise<boolean>} Success status
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if device is tablet
 * @returns {boolean} True if tablet device
 */
export const isTablet = () => {
  return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
};

/**
 * Get device type
 * @returns {string} Device type ('mobile', 'tablet', 'desktop')
 */
export const getDeviceType = () => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

/**
 * Check if browser supports feature
 * @param {string} feature - Feature to check
 * @returns {boolean} True if supported
 */
export const isFeatureSupported = (feature) => {
  const features = {
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof Storage !== 'undefined',
    geolocation: 'geolocation' in navigator,
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    webp: (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })()
  };
  
  return features[feature] || false;
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise<any>} Function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

/**
 * Create a promise that resolves after specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} Promise that resolves after delay
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if value is null or undefined
 * @param {any} value - Value to check
 * @returns {boolean} True if null or undefined
 */
export const isNullish = (value) => {
  return value === null || value === undefined;
};

/**
 * Check if value is a valid number
 * @param {any} value - Value to check
 * @returns {boolean} True if valid number
 */
export const isValidNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Check if value is a valid string
 * @param {any} value - Value to check
 * @returns {boolean} True if valid string
 */
export const isValidString = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if value is a valid email
 * @param {any} value - Value to check
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof value === 'string' && emailRegex.test(value);
};

export default {
  debounce,
  throttle,
  generateId,
  deepClone,
  isEmpty,
  getNestedProperty,
  setNestedProperty,
  removeDuplicates,
  groupBy,
  sortBy,
  filterBySearch,
  paginate,
  storage,
  sessionStorage,
  copyToClipboard,
  downloadFile,
  isMobile,
  isTablet,
  getDeviceType,
  isFeatureSupported,
  retryWithBackoff,
  delay,
  isNullish,
  isValidNumber,
  isValidString,
  isValidEmail
};
