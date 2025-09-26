import { VALIDATION, REGEX_PATTERNS, ERROR_MESSAGES } from './constants.js';

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {object} Validation result
 */
export const validateEmail = (email = '') => {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (trimmedEmail.length > VALIDATION.EMAIL_MAX_LENGTH) {
    return { isValid: false, message: `Email must be less than ${VALIDATION.EMAIL_MAX_LENGTH} characters` };
  }
  
  if (!REGEX_PATTERNS.EMAIL.test(trimmedEmail)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {object} Validation result
 */
export const validatePassword = (password = '') => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { isValid: false, message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long` };
  }
  
  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    return { isValid: false, message: `Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters` };
  }
  
  // Optional: Check for strong password
  if (!REGEX_PATTERNS.PASSWORD.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate name (first name, last name, etc.)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateName = (name = '', fieldName = 'Name') => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, message: `${fieldName} must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long` };
  }
  
  if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, message: `${fieldName} must be less than ${VALIDATION.NAME_MAX_LENGTH} characters` };
  }
  
  if (!REGEX_PATTERNS.NAME.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} can only contain letters and spaces` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} Validation result
 */
export const validatePhone = (phone = '') => {
  const cleanedPhone = phone.replace(/\D/g, '');
  
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (cleanedPhone.length < VALIDATION.PHONE_MIN_LENGTH) {
    return { isValid: false, message: `Phone number must be at least ${VALIDATION.PHONE_MIN_LENGTH} digits` };
  }
  
  if (cleanedPhone.length > VALIDATION.PHONE_MAX_LENGTH) {
    return { isValid: false, message: `Phone number must be less than ${VALIDATION.PHONE_MAX_LENGTH} digits` };
  }
  
  if (!REGEX_PATTERNS.PHONE.test(cleanedPhone)) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateMinLength = (value = '', minLength, fieldName = 'Field') => {
  if (value.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateMaxLength = (value = '', maxLength, fieldName = 'Field') => {
  if (value.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateNumberRange = (value, min, max, fieldName = 'Number') => {
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }
  
  if (numValue < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}` };
  }
  
  if (numValue > max) {
    return { isValid: false, message: `${fieldName} must be less than ${max}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate currency amount
 * @param {number} amount - Amount to validate
 * @param {number} minAmount - Minimum amount
 * @returns {object} Validation result
 */
export const validateCurrency = (amount, minAmount = 0) => {
  const numAmount = Number(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Please enter a valid amount' };
  }
  
  if (numAmount < minAmount) {
    return { isValid: false, message: `Amount must be at least ${minAmount}` };
  }
  
  if (!REGEX_PATTERNS.CURRENCY.test(numAmount.toString())) {
    return { isValid: false, message: 'Please enter a valid currency amount' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `Please enter a valid ${fieldName.toLowerCase()}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate future date
 * @param {string|Date} date - Date to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} Validation result
 */
export const validateFutureDate = (date, fieldName = 'Date') => {
  const dateValidation = validateDate(date, fieldName);
  
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return { isValid: false, message: `${fieldName} must be in the future` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {object} Validation result
 */
export const validateUrl = (url = '') => {
  if (!url) {
    return { isValid: false, message: 'URL is required' };
  }
  
  if (!REGEX_PATTERNS.URL.test(url)) {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {object} Validation result
 */
export const validateFile = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  if (!file) {
    return { isValid: false, message: 'Please select a file' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, message: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate campaign form
 * @param {object} formData - Campaign form data
 * @returns {object} Validation result
 */
export const validateCampaignForm = (formData = {}) => {
  const errors = {};
  let isValid = true;
  
  // Campaign name
  const nameValidation = validateName(formData.campaignName, 'Campaign name');
  if (!nameValidation.isValid) {
    errors.campaignName = nameValidation.message;
    isValid = false;
  }
  
  // Description
  const descriptionValidation = validateMaxLength(
    formData.description || '', 
    VALIDATION.DESCRIPTION_MAX_LENGTH, 
    'Description'
  );
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.message;
    isValid = false;
  }
  
  // Amount
  const amountValidation = validateCurrency(formData.amount, 1);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.message;
    isValid = false;
  }
  
  // Deadline
  const deadlineValidation = validateFutureDate(formData.deadline, 'Deadline');
  if (!deadlineValidation.isValid) {
    errors.deadline = deadlineValidation.message;
    isValid = false;
  }
  
  return { isValid, errors };
};

/**
 * Validate donor registration form
 * @param {object} formData - Donor form data
 * @returns {object} Validation result
 */
export const validateDonorForm = (formData = {}) => {
  const errors = {};
  let isValid = true;
  
  // Name
  const nameValidation = validateName(formData.name, 'Name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }
  
  // Email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }
  
  // Password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    isValid = false;
  }
  
  // Phone (optional)
  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

/**
 * Validate school registration form
 * @param {object} formData - School form data
 * @returns {object} Validation result
 */
export const validateSchoolForm = (formData = {}) => {
  const errors = {};
  let isValid = true;
  
  // School name
  const schoolNameValidation = validateName(formData.schoolName, 'School name');
  if (!schoolNameValidation.isValid) {
    errors.schoolName = schoolNameValidation.message;
    isValid = false;
  }
  
  // Principal name
  const principalNameValidation = validateName(formData.principalName, 'Principal name');
  if (!principalNameValidation.isValid) {
    errors.principalName = principalNameValidation.message;
    isValid = false;
  }
  
  // Email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }
  
  // Contact number
  const phoneValidation = validatePhone(formData.contactNumber);
  if (!phoneValidation.isValid) {
    errors.contactNumber = phoneValidation.message;
    isValid = false;
  }
  
  // Address
  const addressValidation = validateRequired(formData.address, 'Address');
  if (!addressValidation.isValid) {
    errors.address = addressValidation.message;
    isValid = false;
  }
  
  return { isValid, errors };
};

/**
 * Validate login form
 * @param {object} formData - Login form data
 * @returns {object} Validation result
 */
export const validateLoginForm = (formData = {}) => {
  const errors = {};
  let isValid = true;
  
  // Email/Username
  const emailValidation = validateRequired(formData.email, 'Email/Username');
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }
  
  // Password
  const passwordValidation = validateRequired(formData.password, 'Password');
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    isValid = false;
  }
  
  return { isValid, errors };
};

/**
 * Validate donation form
 * @param {object} formData - Donation form data
 * @returns {object} Validation result
 */
export const validateDonationForm = (formData = {}) => {
  const errors = {};
  let isValid = true;
  
  // Amount (for monetary donations)
  if (formData.amount) {
    const amountValidation = validateCurrency(formData.amount, 1);
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.message;
      isValid = false;
    }
  }
  
  // Delivery method (for non-monetary donations)
  if (formData.deliveryMethod) {
    const deliveryValidation = validateRequired(formData.deliveryMethod, 'Delivery method');
    if (!deliveryValidation.isValid) {
      errors.deliveryMethod = deliveryValidation.message;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

/**
 * Get validation error message for a field
 * @param {string} fieldName - Field name
 * @param {string} errorType - Type of error
 * @returns {string} Error message
 */
export const getValidationErrorMessage = (fieldName, errorType) => {
  const errorMessages = {
    required: `${fieldName} is required`,
    email: 'Please enter a valid email address',
    password: 'Password must be at least 6 characters long',
    phone: 'Please enter a valid phone number',
    minLength: `${fieldName} is too short`,
    maxLength: `${fieldName} is too long`,
    number: `${fieldName} must be a valid number`,
    date: `Please enter a valid ${fieldName.toLowerCase()}`,
    url: 'Please enter a valid URL',
    file: 'Please select a valid file'
  };
  
  return errorMessages[errorType] || `${fieldName} is invalid`;
};

export default {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumberRange,
  validateCurrency,
  validateDate,
  validateFutureDate,
  validateUrl,
  validateFile,
  validateCampaignForm,
  validateDonorForm,
  validateSchoolForm,
  validateLoginForm,
  validateDonationForm,
  getValidationErrorMessage
};
