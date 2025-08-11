import api from '../lib/api';

export const fetchDonorHistory = async () => {
  try {
    const response = await api.get('/api/donations/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching donor history:', error);
    throw error;
  }
}; 