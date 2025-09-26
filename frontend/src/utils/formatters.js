import { DEFAULT_VALUES } from './constants.js';

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: LKR)
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount = 0, currency = DEFAULT_VALUES.CURRENCY, locale = DEFAULT_VALUES.DATE_FORMAT) => {
  const numAmount = Number(amount) || 0;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${DEFAULT_VALUES.CURRENCY_SYMBOL} ${numAmount.toLocaleString()}`;
  }
};

/**
 * Format currency with custom symbol
 * @param {number} amount - Amount to format
 * @param {string} symbol - Currency symbol (default: Rs.)
 * @returns {string} Formatted currency string
 */
export const formatCurrencyWithSymbol = (amount = 0, symbol = DEFAULT_VALUES.CURRENCY_SYMBOL) => {
  const numAmount = Number(amount) || 0;
  return `${symbol} ${numAmount.toLocaleString()}`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num = 0, decimals = 1) => {
  const number = Number(num) || 0;
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(decimals) + 'B';
  }
  
  if (number >= 1000000) {
    return (number / 1000000).toFixed(decimals) + 'M';
  }
  
  if (number >= 1000) {
    return (number / 1000).toFixed(decimals) + 'K';
  }
  
  return number.toString();
};

/**
 * Format percentage values
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value = 0, decimals = 0) => {
  const numValue = Number(value) || 0;
  return `${numValue.toFixed(decimals)}%`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return dateObj.toLocaleDateString(DEFAULT_VALUES.DATE_FORMAT, formatOptions);
  } catch (error) {
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format date to short string (MM/DD/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Short formatted date string
 */
export const formatDateShort = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format date to relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  // Future dates
  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    
    if (absDiff < 60) return 'in a few seconds';
    if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
    if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
    if (absDiff < 2592000) return `in ${Math.floor(absDiff / 86400)} days`;
    if (absDiff < 31536000) return `in ${Math.floor(absDiff / 2592000)} months`;
    return `in ${Math.floor(absDiff / 31536000)} years`;
  }
  
  // Past dates
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

/**
 * Format time to readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTime = (date, options = {}) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return dateObj.toLocaleTimeString(DEFAULT_VALUES.DATE_FORMAT, formatOptions);
  } catch (error) {
    return dateObj.toLocaleTimeString();
  }
};

/**
 * Format datetime to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return '-';
  
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Format text to title case
 * @param {string} text - Text to format
 * @returns {string} Title case text
 */
export const formatTitleCase = (text = '') => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Format text to sentence case
 * @param {string} text - Text to format
 * @returns {string} Sentence case text
 */
export const formatSentenceCase = (text = '') => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text = '', maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone = '') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes = 0, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format duration in human readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  
  return `${secs}s`;
};

/**
 * Format name (capitalize first letter of each word)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export const formatName = (name = '') => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format email (lowercase and trim)
 * @param {string} email - Email to format
 * @returns {string} Formatted email
 */
export const formatEmail = (email = '') => {
  return email.toLowerCase().trim();
};

/**
 * Format URL (ensure protocol)
 * @param {string} url - URL to format
 * @returns {string} Formatted URL
 */
export const formatUrl = (url = '') => {
  if (!url) return '';
  
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }
  
  return url;
};

/**
 * Format status text (capitalize and replace underscores)
 * @param {string} status - Status to format
 * @returns {string} Formatted status
 */
export const formatStatus = (status = '') => {
  if (!status) return '';
  
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format campaign type display name
 * @param {string} type - Campaign type
 * @returns {string} Formatted type
 */
export const formatCampaignType = (type = '') => {
  const typeMap = {
    'monetary': '💰 Monetary',
    'non-monetary': '📦 Non-Monetary',
    'Monetary': '💰 Monetary',
    'Non-Monetary': '📦 Non-Monetary'
  };
  
  return typeMap[type] || type;
};

/**
 * Format progress status based on percentage
 * @param {number} progress - Progress percentage
 * @returns {object} Status information
 */
export const formatProgressStatus = (progress = 0) => {
  if (progress >= 100) {
    return {
      text: 'Completed',
      color: 'green',
      icon: '✅'
    };
  }
  
  if (progress >= 75) {
    return {
      text: 'Almost Complete',
      color: 'blue',
      icon: '🔥'
    };
  }
  
  if (progress >= 50) {
    return {
      text: 'Halfway There',
      color: 'yellow',
      icon: '⚡'
    };
  }
  
  if (progress >= 25) {
    return {
      text: 'Getting Started',
      color: 'orange',
      icon: '🚀'
    };
  }
  
  return {
    text: 'Just Started',
    color: 'gray',
    icon: '🌱'
  };
};

export default {
  formatCurrency,
  formatCurrencyWithSymbol,
  formatLargeNumber,
  formatPercentage,
  formatDate,
  formatDateShort,
  formatRelativeTime,
  formatTime,
  formatDateTime,
  formatTitleCase,
  formatSentenceCase,
  truncateText,
  formatPhoneNumber,
  formatFileSize,
  formatDuration,
  formatName,
  formatEmail,
  formatUrl,
  formatStatus,
  formatCampaignType,
  formatProgressStatus
};
