import React from 'react';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';

const OfflineFallback = ({ 
  title = "You're Offline", 
  message = "Please check your internet connection and try again.",
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiWifiOff className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-6">{message}</p>
        </div>

        <div className="space-y-3">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FiHome className="w-5 h-5" />
            <span>Go to Home</span>
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">What you can do:</h3>
          <ul className="text-sm text-blue-800 text-left space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Check if other websites work</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;
