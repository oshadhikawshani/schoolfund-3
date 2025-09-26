import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { LoadingSpinner } from './LoadingStates';

const RetryButton = ({ 
  onRetry, 
  loading = false, 
  retryCount = 0, 
  maxRetries = 3,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const canRetry = retryCount < maxRetries;
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  if (!canRetry) {
    return (
      <div className={`inline-flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
        <span>Maximum retries exceeded</span>
      </div>
    );
  }

  return (
    <button
      onClick={onRetry}
      disabled={loading}
      className={`
        inline-flex items-center space-x-2 font-medium rounded-lg transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Retrying...</span>
        </>
      ) : (
        <>
          <FiRefreshCw className="w-4 h-4" />
          <span>
            {retryCount > 0 ? `Retry (${retryCount}/${maxRetries})` : 'Retry'}
          </span>
        </>
      )}
    </button>
  );
};

export default RetryButton;
