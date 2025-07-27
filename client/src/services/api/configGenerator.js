import axios from 'axios';

// Use relative URL in production, full URL in development
const API_BASE_URL = import.meta.env.PROD 
  ? '' // Use relative URLs in production
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const generateConfigAPI = async (prompt, useCase) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate`, {
      prompt,
      useCase
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
    
    return response.data.config;
  } catch (error) {
    console.error('API Error:', error);
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    throw new Error('Failed to generate configuration. Please try again.');
  }
};
