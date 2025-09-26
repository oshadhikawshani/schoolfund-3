import React, { useState } from 'react';
import { useApiWithRetry } from '../hooks/useApiWithRetry';
import { useOffline } from '../hooks/useOffline';
import { fetchCampaigns } from '../api/campaigns';
import { 
  FullPageLoading, 
  CampaignGridSkeleton, 
  ButtonLoading 
} from './LoadingStates';
import ErrorMessage, { InlineError } from './ErrorMessage';
import RetryButton from './RetryButton';
import OfflineFallback from './OfflineFallback';

// Example component showing how to use all the error handling and UX improvements
const ExampleUsage = () => {
  const { isOffline } = useOffline();
  const [showError, setShowError] = useState(false);
  
  // Using the enhanced API hook with retry functionality
  const {
    data: campaigns,
    error,
    loading,
    retryCount,
    canRetry,
    execute: fetchData,
    retry
  } = useApiWithRetry(fetchCampaigns, { maxRetries: 3 });

  // Simulate an error for demonstration
  const simulateError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  // If offline, show offline fallback
  if (isOffline) {
    return <OfflineFallback onRetry={fetchData} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Error Handling & UX Examples</h1>
      
      {/* Example Error Message */}
      {showError && (
        <ErrorMessage
          error="This is an example error message"
          onRetry={() => setShowError(false)}
          onDismiss={() => setShowError(false)}
          className="mb-6"
        />
      )}

      {/* Example Inline Error */}
      {error && (
        <InlineError 
          error={error} 
          onRetry={retry}
          className="mb-6"
        />
      )}

      {/* Action Buttons */}
      <div className="mb-8 space-x-4">
        <ButtonLoading
          loading={loading}
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Fetch Campaigns
        </ButtonLoading>

        <RetryButton
          onRetry={retry}
          loading={loading}
          retryCount={retryCount}
          canRetry={canRetry}
          variant="secondary"
        />

        <button
          onClick={simulateError}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Simulate Error
        </button>
      </div>

      {/* Loading States */}
      {loading && !campaigns && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Loading Campaigns...</h2>
          <CampaignGridSkeleton count={6} />
        </div>
      )}

      {/* Data Display */}
      {campaigns && !loading && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Campaigns ({campaigns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 6).map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">{campaign.campaignName}</h3>
                <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-medium">
                    Rs. {campaign.amount?.toLocaleString() || 0}
                  </span>
                  <span className="text-sm text-gray-500">
                    {campaign.monetaryType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !campaigns && !error && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">
            No campaigns loaded
          </h2>
          <p className="text-gray-500 mb-6">
            Click "Fetch Campaigns" to load some data
          </p>
        </div>
      )}

      {/* Retry Information */}
      {retryCount > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Retry Information:</strong> This request has been retried {retryCount} times.
            {!canRetry && " Maximum retries reached."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExampleUsage;
