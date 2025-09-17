import api from '../lib/api';

export const fetchDonorHistory = async (forceRefresh = false) => {
  try {
    // Only add cache-busting when explicitly requested (e.g., after new donation)
    const url = forceRefresh
      ? `/api/donations/history?t=${Date.now()}`
      : '/api/donations/history';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching donor history:', error);
    throw error;
  }
};

// Fetch all monetary donations from the collection (regardless of user)
export const fetchAllMonetaryDonations = async () => {
  try {
    const response = await api.get('/api/donations/all-monetary');
    return response.data;
  } catch (error) {
    console.error('Error fetching all monetary donations:', error);
    throw error;
  }
};

// Fetch monetary donations statistics
export const fetchMonetaryDonationsStats = async () => {
  try {
    const response = await api.get('/api/donations/monetary-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching monetary donations statistics:', error);
    throw error;
  }
};

// Debug function to check current user
export const checkCurrentUser = async () => {
  try {
    const response = await api.get('/api/donations/debug/current-user');
    return response.data;
  } catch (error) {
    console.error('Error checking current user:', error);
    throw error;
  }
};

// Function to fetch donor details
export const fetchDonorDetails = async () => {
  try {
    const response = await api.get('/api/donors/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching donor details:', error);
    throw error;
  }
};

// Debug function to check campaign IDs in donations
export const debugCampaignIds = async () => {
  try {
    const response = await api.get('/api/donations/debug/campaign-ids');
    return response.data;
  } catch (error) {
    console.error('Error fetching debug campaign IDs:', error);
    throw error;
  }
}; 

// Donor stats (totals and badge)
export const fetchMyDonorStats = async () => {
  try {
    const response = await api.get('/api/donors/me/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching donor stats:', error);
    throw error;
  }
};

// Top donors
export const fetchTopDonors = async () => {
  try {
    const response = await api.get('/api/donors/top');
    return response.data;
  } catch (error) {
    console.error('Error fetching top donors:', error);
    throw error;
  }
};