import React from 'react';

// Basic Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

// Full Page Loading
export const FullPageLoading = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" className="mx-auto mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

// Inline Loading
export const InlineLoading = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center space-x-2 py-4">
    <LoadingSpinner size="sm" />
    <span className="text-gray-600 text-sm">{message}</span>
  </div>
);

// Button Loading State
export const ButtonLoading = ({ loading, children, ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${props.className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span>Loading...</span>
      </div>
    ) : (
      children
    )}
  </button>
);

// Skeleton Components
export const SkeletonBox = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonBox width="w-12" height="h-12" className="rounded-full" />
      <div className="flex-1">
        <SkeletonBox width="w-3/4" height="h-4" className="mb-2" />
        <SkeletonBox width="w-1/2" height="h-3" />
      </div>
    </div>
    <SkeletonBox height="h-20" className="mb-4" />
    <div className="flex space-x-2">
      <SkeletonBox width="w-20" height="h-8" />
      <SkeletonBox width="w-16" height="h-8" />
    </div>
  </div>
);

export const SkeletonCampaignCard = () => (
  <div className="bg-white rounded-xl shadow-lg border overflow-hidden animate-pulse">
    <SkeletonBox width="w-full" height="h-48" />
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <SkeletonBox width="w-3/4" height="h-6" />
        <SkeletonBox width="w-20" height="h-6" className="rounded-full" />
      </div>
      <SkeletonBox width="w-full" height="h-4" className="mb-2" />
      <SkeletonBox width="w-2/3" height="h-4" className="mb-4" />
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <SkeletonBox width="w-12" height="h-4" />
        </div>
        <SkeletonBox width="w-full" height="h-3" className="mb-2" />
        <div className="flex justify-between text-xs">
          <SkeletonBox width="w-20" height="h-3" />
          <SkeletonBox width="w-16" height="h-3" />
        </div>
      </div>
      
      <SkeletonBox width="w-full" height="h-10" className="rounded-lg" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <SkeletonBox width="w-32" height="h-6" />
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <SkeletonBox width="w-20" height="h-4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap">
                  <SkeletonBox width="w-24" height="h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Campaign Grid Skeleton
export const CampaignGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCampaignCard key={i} />
    ))}
  </div>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <SkeletonBox width="w-24" height="h-4" className="mb-2" />
            <SkeletonBox width="w-16" height="h-8" />
          </div>
          <SkeletonBox width="w-12" height="h-12" className="rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// Progress Bar Skeleton
export const ProgressBarSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between items-center mb-2">
      <SkeletonBox width="w-12" height="h-4" />
    </div>
    <SkeletonBox width="w-full" height="h-3" className="mb-2" />
    <div className="flex justify-between text-xs">
      <SkeletonBox width="w-20" height="h-3" />
      <SkeletonBox width="w-16" height="h-3" />
    </div>
  </div>
);

export default {
  LoadingSpinner,
  FullPageLoading,
  InlineLoading,
  ButtonLoading,
  SkeletonBox,
  SkeletonCard,
  SkeletonCampaignCard,
  SkeletonTable,
  CampaignGridSkeleton,
  DashboardStatsSkeleton,
  ProgressBarSkeleton
};
