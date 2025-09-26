import React from 'react';
import { FiAlertTriangle, FiX, FiRefreshCw, FiInfo } from 'react-icons/fi';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss, 
  variant = 'error',
  showRetry = true,
  showDismiss = true,
  className = ''
}) => {
  const getErrorDetails = (error) => {
    if (typeof error === 'string') return error;
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  const getErrorType = (error) => {
    if (error?.response?.status === 401) return 'auth';
    if (error?.response?.status === 403) return 'permission';
    if (error?.response?.status === 404) return 'notFound';
    if (error?.response?.status >= 500) return 'server';
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) return 'network';
    return 'general';
  };

  const getErrorConfig = (errorType) => {
    const configs = {
      auth: {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
        icon: '🔐',
        color: 'yellow',
        actions: ['login']
      },
      permission: {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        icon: '🚫',
        color: 'red',
        actions: ['contact']
      },
      notFound: {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        icon: '🔍',
        color: 'blue',
        actions: ['home']
      },
      server: {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again later.',
        icon: '⚠️',
        color: 'red',
        actions: ['retry', 'contact']
      },
      network: {
        title: 'Connection Problem',
        message: 'Please check your internet connection and try again.',
        icon: '📡',
        color: 'orange',
        actions: ['retry']
      },
      general: {
        title: 'Something went wrong',
        message: 'An unexpected error occurred. Please try again.',
        icon: '❌',
        color: 'red',
        actions: ['retry']
      }
    };
    
    return configs[errorType] || configs.general;
  };

  const errorType = getErrorType(error);
  const config = getErrorConfig(errorType);
  const errorMessage = getErrorDetails(error);

  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800'
  };

  const iconColorClasses = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[config.color]} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiAlertTriangle className={`w-5 h-5 ${iconColorClasses[config.color]}`} />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium mb-1">
            {config.title}
          </h3>
          <p className="text-sm mb-3">
            {errorMessage}
          </p>
          
          <div className="flex items-center space-x-3">
            {config.actions.includes('retry') && showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center space-x-1 text-sm font-medium hover:underline"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            )}
            
            {config.actions.includes('login') && (
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center space-x-1 text-sm font-medium hover:underline"
              >
                <span>Log In</span>
              </button>
            )}
            
            {config.actions.includes('home') && (
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center space-x-1 text-sm font-medium hover:underline"
              >
                <span>Go Home</span>
              </button>
            )}
            
            {config.actions.includes('contact') && (
              <button
                onClick={() => window.open('mailto:support@schoolfundraising.org')}
                className="inline-flex items-center space-x-1 text-sm font-medium hover:underline"
              >
                <span>Contact Support</span>
              </button>
            )}
          </div>
        </div>
        
        {showDismiss && onDismiss && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={onDismiss}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline Error Message (smaller version)
export const InlineError = ({ error, onRetry, className = '' }) => (
  <div className={`text-red-600 text-sm ${className}`}>
    <div className="flex items-center space-x-2">
      <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>{typeof error === 'string' ? error : error?.message || 'An error occurred'}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 text-red-700 hover:text-red-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

// Success Message
export const SuccessMessage = ({ message, onDismiss, className = '' }) => (
  <div className={`bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 ${className}`}>
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <FiInfo className="w-5 h-5 text-green-600" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm">{message}</p>
      </div>
      {onDismiss && (
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={onDismiss}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-green-200 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  </div>
);

export default ErrorMessage;
