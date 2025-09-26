import { BADGE_THRESHOLDS, TIME_CONSTANTS } from './constants.js';

/**
 * Calculate progress percentage for campaigns
 * @param {number} raised - Amount raised or items received
 * @param {number} goal - Target amount or items needed
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (raised = 0, goal = 0) => {
  const safeGoal = Number(goal) || 0;
  const safeRaised = Number(raised) || 0;
  
  if (safeGoal <= 0) return 0;
  
  return Math.min(Math.round((safeRaised / safeGoal) * 100), 100);
};

/**
 * Calculate remaining amount or items needed
 * @param {number} raised - Amount raised or items received
 * @param {number} goal - Target amount or items needed
 * @returns {number} Remaining amount/items
 */
export const calculateRemaining = (raised = 0, goal = 0) => {
  const safeGoal = Number(goal) || 0;
  const safeRaised = Number(raised) || 0;
  
  return Math.max(0, safeGoal - safeRaised);
};

/**
 * Calculate days remaining until deadline
 * @param {string|Date} deadline - Campaign deadline
 * @returns {number} Days remaining (can be negative if overdue)
 */
export const calculateDaysRemaining = (deadline) => {
  if (!deadline) return 0;
  
  const endDate = new Date(deadline);
  const now = new Date();
  
  // Handle invalid dates
  if (isNaN(endDate.getTime())) return 0;
  
  return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
};

/**
 * Check if campaign is urgent (less than 7 days remaining)
 * @param {string|Date} deadline - Campaign deadline
 * @returns {boolean} True if urgent
 */
export const isCampaignUrgent = (deadline) => {
  const daysRemaining = calculateDaysRemaining(deadline);
  return daysRemaining > 0 && daysRemaining <= TIME_CONSTANTS.URGENT_DAYS;
};

/**
 * Check if campaign is long-term (more than 30 days remaining)
 * @param {string|Date} deadline - Campaign deadline
 * @returns {boolean} True if long-term
 */
export const isCampaignLongTerm = (deadline) => {
  const daysRemaining = calculateDaysRemaining(deadline);
  return daysRemaining > TIME_CONSTANTS.MONTH_DAYS;
};

/**
 * Check if campaign is ending this month
 * @param {string|Date} deadline - Campaign deadline
 * @returns {boolean} True if ending this month
 */
export const isCampaignEndingThisMonth = (deadline) => {
  if (!deadline) return false;
  
  const endDate = new Date(deadline);
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return endDate <= monthEnd && calculateDaysRemaining(deadline) > 0;
};

/**
 * Calculate donor badge based on total monetary donations
 * @param {number} totalAmount - Total monetary donations
 * @returns {string} Badge name (None, Bronze, Silver, Gold)
 */
export const calculateDonorBadge = (totalAmount = 0) => {
  const amount = Number(totalAmount) || 0;
  
  if (amount >= BADGE_THRESHOLDS.GOLD.MONETARY) {
    return BADGE_THRESHOLDS.GOLD.NAME;
  }
  
  if (amount >= BADGE_THRESHOLDS.SILVER.MONETARY) {
    return BADGE_THRESHOLDS.SILVER.NAME;
  }
  
  if (amount >= BADGE_THRESHOLDS.BRONZE.MONETARY) {
    return BADGE_THRESHOLDS.BRONZE.NAME;
  }
  
  return 'None';
};

/**
 * Calculate donor badge based on non-monetary donations
 * @param {number} totalItems - Total non-monetary items donated
 * @returns {string} Badge name (None, Bronze, Silver, Gold)
 */
export const calculateDonorBadgeNonMonetary = (totalItems = 0) => {
  const items = Number(totalItems) || 0;
  
  if (items >= BADGE_THRESHOLDS.GOLD.NON_MONETARY) {
    return BADGE_THRESHOLDS.GOLD.NAME;
  }
  
  if (items >= BADGE_THRESHOLDS.SILVER.NON_MONETARY) {
    return BADGE_THRESHOLDS.SILVER.NAME;
  }
  
  if (items >= BADGE_THRESHOLDS.BRONZE.NON_MONETARY) {
    return BADGE_THRESHOLDS.BRONZE.NAME;
  }
  
  return 'None';
};

/**
 * Calculate the highest badge a donor can achieve
 * @param {number} monetaryTotal - Total monetary donations
 * @param {number} nonMonetaryTotal - Total non-monetary items
 * @returns {string} Highest badge name
 */
export const calculateHighestBadge = (monetaryTotal = 0, nonMonetaryTotal = 0) => {
  const monetaryBadge = calculateDonorBadge(monetaryTotal);
  const nonMonetaryBadge = calculateDonorBadgeNonMonetary(nonMonetaryTotal);
  
  const badgeRank = (badge) => {
    switch (badge) {
      case 'Gold': return 3;
      case 'Silver': return 2;
      case 'Bronze': return 1;
      default: return 0;
    }
  };
  
  return badgeRank(monetaryBadge) > badgeRank(nonMonetaryBadge) 
    ? monetaryBadge 
    : nonMonetaryBadge;
};

/**
 * Calculate progress towards next badge
 * @param {number} currentAmount - Current total amount
 * @param {string} currentBadge - Current badge name
 * @returns {object} Progress information
 */
export const calculateBadgeProgress = (currentAmount = 0, currentBadge = 'None') => {
  const amount = Number(currentAmount) || 0;
  
  let nextThreshold = 0;
  let nextBadge = 'Bronze';
  
  if (currentBadge === 'None') {
    nextThreshold = BADGE_THRESHOLDS.BRONZE.MONETARY;
    nextBadge = 'Bronze';
  } else if (currentBadge === 'Bronze') {
    nextThreshold = BADGE_THRESHOLDS.SILVER.MONETARY;
    nextBadge = 'Silver';
  } else if (currentBadge === 'Silver') {
    nextThreshold = BADGE_THRESHOLDS.GOLD.MONETARY;
    nextBadge = 'Gold';
  } else {
    // Already at highest badge
    return {
      progress: 100,
      nextBadge: null,
      remaining: 0,
      isMaxLevel: true
    };
  }
  
  const progress = Math.min((amount / nextThreshold) * 100, 100);
  const remaining = Math.max(0, nextThreshold - amount);
  
  return {
    progress: Math.round(progress),
    nextBadge,
    remaining,
    isMaxLevel: false
  };
};

/**
 * Calculate monthly progress for donor goals
 * @param {Array} donations - Array of donation objects with createdAt and amount
 * @param {number} monthlyGoal - Monthly goal amount
 * @returns {object} Monthly progress information
 */
export const calculateMonthlyProgress = (donations = [], monthlyGoal = 5000) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyDonations = donations.filter(donation => {
    const donationDate = new Date(donation.createdAt);
    return donationDate.getMonth() === currentMonth && 
           donationDate.getFullYear() === currentYear;
  });
  
  const monthlyAmount = monthlyDonations.reduce((sum, donation) => 
    sum + (Number(donation.amount) || 0), 0
  );
  
  const progress = Math.min((monthlyAmount / monthlyGoal) * 100, 100);
  
  return {
    amount: monthlyAmount,
    goal: monthlyGoal,
    progress: Math.round(progress),
    remaining: Math.max(0, monthlyGoal - monthlyAmount),
    donations: monthlyDonations.length
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {object} location1 - {lat, lng}
 * @param {object} location2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (location1, location2) => {
  if (!location1?.lat || !location1?.lng || !location2?.lat || !location2?.lng) {
    return Infinity;
  }

  const lat1 = parseFloat(location1.lat) * Math.PI / 180;
  const lng1 = parseFloat(location1.lng) * Math.PI / 180;
  const lat2 = parseFloat(location2.lat) * Math.PI / 180;
  const lng2 = parseFloat(location2.lng) * Math.PI / 180;

  const R = 6371; // Earth's radius in kilometers
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Calculate campaign statistics
 * @param {Array} campaigns - Array of campaign objects
 * @returns {object} Campaign statistics
 */
export const calculateCampaignStats = (campaigns = []) => {
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => 
    c.status === 'approved' && calculateDaysRemaining(c.deadline) > 0
  ).length;
  
  const completedCampaigns = campaigns.filter(c => 
    calculateProgress(c.raised || 0, c.amount || 0) >= 100
  ).length;
  
  const urgentCampaigns = campaigns.filter(c => 
    isCampaignUrgent(c.deadline)
  ).length;
  
  const totalRaised = campaigns.reduce((sum, c) => 
    sum + (Number(c.raised) || 0), 0
  );
  
  const totalGoal = campaigns.reduce((sum, c) => 
    sum + (Number(c.amount) || 0), 0
  );
  
  const overallProgress = calculateProgress(totalRaised, totalGoal);
  
  return {
    totalCampaigns,
    activeCampaigns,
    completedCampaigns,
    urgentCampaigns,
    totalRaised,
    totalGoal,
    overallProgress,
    averageProgress: totalCampaigns > 0 
      ? campaigns.reduce((sum, c) => 
          sum + calculateProgress(c.raised || 0, c.amount || 0), 0
        ) / totalCampaigns 
      : 0
  };
};

/**
 * Calculate donor statistics
 * @param {Array} donations - Array of donation objects
 * @returns {object} Donor statistics
 */
export const calculateDonorStats = (donations = []) => {
  const monetaryDonations = donations.filter(d => d.amount);
  const nonMonetaryDonations = donations.filter(d => !d.amount);
  
  const totalAmount = monetaryDonations.reduce((sum, d) => 
    sum + (Number(d.amount) || 0), 0
  );
  
  const totalItems = nonMonetaryDonations.length;
  
  const badge = calculateDonorBadge(totalAmount);
  
  const monthlyProgress = calculateMonthlyProgress(monetaryDonations);
  
  return {
    totalDonations: donations.length,
    monetaryDonations: monetaryDonations.length,
    nonMonetaryDonations: nonMonetaryDonations.length,
    totalAmount,
    totalItems,
    badge,
    monthlyProgress,
    averageDonation: monetaryDonations.length > 0 
      ? totalAmount / monetaryDonations.length 
      : 0
  };
};

export default {
  calculateProgress,
  calculateRemaining,
  calculateDaysRemaining,
  isCampaignUrgent,
  isCampaignLongTerm,
  isCampaignEndingThisMonth,
  calculateDonorBadge,
  calculateDonorBadgeNonMonetary,
  calculateHighestBadge,
  calculateBadgeProgress,
  calculateMonthlyProgress,
  calculateDistance,
  calculateCampaignStats,
  calculateDonorStats
};
