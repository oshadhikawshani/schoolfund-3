import React from 'react';
import { 
  calculateProgress, 
  calculateDaysRemaining, 
  isCampaignUrgent,
  formatCurrency, 
  formatDate, 
  formatRelativeTime,
  formatCampaignType,
  formatProgressStatus,
  BADGE_THRESHOLDS,
  TIME_CONSTANTS
} from '../utils';

/**
 * Refactored Campaign Card Component
 * Demonstrates how to use the new utility functions
 */
const RefactoredCampaignCard = ({ campaign, onDonate, onViewDetails }) => {
  // Use utility functions instead of inline calculations
  const progress = calculateProgress(campaign.raised, campaign.amount);
  const daysRemaining = calculateDaysRemaining(campaign.deadline);
  const isUrgent = isCampaignUrgent(campaign.deadline);
  const progressStatus = formatProgressStatus(progress);
  
  // Use formatters for consistent display
  const formattedAmount = formatCurrency(campaign.amount);
  const formattedRaised = formatCurrency(campaign.raised);
  const formattedDeadline = formatDate(campaign.deadline);
  const relativeTime = formatRelativeTime(campaign.deadline);
  const campaignType = formatCampaignType(campaign.type);
  
  // Use constants instead of magic numbers
  const isUrgentClass = isUrgent ? 'border-red-500 bg-red-50' : 'border-gray-200';
  const progressColor = progress >= 100 ? 'bg-green-500' : 
                       progress >= 75 ? 'bg-blue-500' : 
                       progress >= 50 ? 'bg-yellow-500' : 'bg-gray-500';
  
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${isUrgentClass} transition-all duration-200 hover:shadow-lg`}>
      {/* Campaign Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {campaign.title}
          </h3>
          <span className="text-sm text-gray-500 ml-2">
            {campaignType}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2">
          {campaign.description}
        </p>
      </div>
      
      {/* Progress Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {progressStatus.icon} {progressStatus.text}
          </span>
          <span className="text-sm text-gray-500">
            {progress}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>Raised: {formattedRaised}</span>
          <span>Goal: {formattedAmount}</span>
        </div>
        
        {/* Deadline Section */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-gray-500">Deadline:</span>
            <span className={isUrgent ? 'text-red-600 font-medium' : 'text-gray-700'}>
              {formattedDeadline}
            </span>
          </div>
          
          {daysRemaining > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUrgent 
                ? 'bg-red-100 text-red-800' 
                : daysRemaining <= TIME_CONSTANTS.URGENT_DAYS * 2
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {daysRemaining} days left
            </span>
          )}
        </div>
        
        {daysRemaining <= 0 && (
          <div className="mt-2 text-center">
            <span className="text-red-600 text-sm font-medium">
              Campaign ended {relativeTime}
            </span>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-100 flex space-x-2">
        <button
          onClick={() => onViewDetails(campaign)}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
        >
          View Details
        </button>
        
        {daysRemaining > 0 && progress < 100 && (
          <button
            onClick={() => onDonate(campaign)}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Donate Now
          </button>
        )}
      </div>
    </div>
  );
};

export default RefactoredCampaignCard;
