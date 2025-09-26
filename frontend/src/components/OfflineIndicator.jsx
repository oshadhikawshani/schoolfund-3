import React from 'react';
import { useOffline } from '../hooks/useOffline';
import { FiWifi, FiWifiOff, FiCheckCircle } from 'react-icons/fi';

const OfflineIndicator = () => {
  const { isOffline, wasOffline } = useOffline();

  if (!isOffline && !wasOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {isOffline ? (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <FiWifiOff className="w-5 h-5" />
            <span className="font-medium">You're offline. Some features may not work properly.</span>
          </div>
        </div>
      ) : wasOffline ? (
        <div className="bg-green-600 text-white px-4 py-3 shadow-lg animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <FiCheckCircle className="w-5 h-5" />
            <span className="font-medium">You're back online!</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
