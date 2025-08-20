import api from '../lib/api';

export const fetchCampaigns = async (params = {}) => {
  try {
    const response = await api.get('/api/campaigns', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

export const fetchCampaignById = async (id) => {
  try {
    console.log('Fetching campaign with ID:', id, 'Type:', typeof id);
    const response = await api.get(`/api/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await api.get('/api/campaigns/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Debug function to list all campaigns
export const debugListCampaigns = async () => {
  try {
    const response = await api.get('/api/campaigns/debug/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching debug campaign list:', error);
    throw error;
  }
}; 