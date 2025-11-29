// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Methods
export const stockAPI = {
  // Get all stocks
  getAllStocks: async () => {
    const response = await api.get('/stocks');
    return response.data;
  },

  // Get real-time quotes
  getQuotes: async () => {
    const response = await api.get('/quotes');
    return response.data;
  },

  // Get stock details
  getStockDetails: async (symbol) => {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  },

  // Get historical prices
  getPrices: async (symbol, period = '1y') => {
    const response = await api.get(`/prices/${symbol}`, {
      params: { period }
    });
    return response.data;
  },

  // Get technical indicators
  getIndicators: async (symbol) => {
    const response = await api.get(`/indicators/${symbol}`);
    return response.data;
  },

  // Get sector performance
  getSectors: async () => {
    const response = await api.get('/sectors');
    return response.data;
  },

  // Get returns data
  getReturns: async () => {
    const response = await api.get('/returns');
    return response.data;
  },

  // Get financial statements
  getFinancials: async (symbol) => {
    const response = await api.get(`/financials/${symbol}`);
    return response.data;
  },

  // Get trading signals
  getSignals: async (symbol) => {
    const response = await api.get(`/signals/${symbol}`);
    return response.data;
  },

  // Get correlations
  getCorrelations: async (symbol) => {
    const response = await api.get(`/correlations/${symbol}`);
    return response.data;
  },

  // Get monthly returns heatmap
  getHeatmap: async (symbol) => {
    const response = await api.get(`/heatmap/${symbol}`);
    return response.data;
  },

  // Get market summary
  getSummary: async () => {
    const response = await api.get('/summary');
    return response.data;
  },
};

export default api;