import axios from 'axios';

// Create an instance of axios with default config
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Help Request API calls
export const submitHelpRequest = async (formData) => {
    try {
        const response = await api.post('/help-requests', formData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHelpRequestStatus = async (requestId) => {
    try {
        const response = await api.get(`/help-requests/${requestId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;