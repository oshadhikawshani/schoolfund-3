import api from '../lib/api';

export const fetchDonorHistory = async () => {
  try {
    // Add cache-busting parameter to prevent caching
    const timestamp = Date.now();
    const response = await api.get(`/api/donations/history?t=${timestamp}`);
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