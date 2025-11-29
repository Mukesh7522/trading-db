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

export const stockAPI = {
  getAllStocks: async () => {
    const response = await api.get('/stocks');
    return response.data;
  },

  getQuotes: async () => {
    const response = await api.get('/quotes');
    return response.data;
  },

  getStockDetails: async (symbol) => {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  },

  getPrices: async (symbol, period = '1y') => {
    const response = await api.get(`/prices/${symbol}`, {
      params: { period }
    });
    return response.data;
  },

  getIndicators: async (symbol) => {
    const response = await api.get(`/indicators/${symbol}`);
    return response.data;
  },

  getSectors: async () => {
    const response = await api.get('/sectors');
    return response.data;
  },

  getReturns: async () => {
    const response = await api.get('/returns');
    return response.data;
  },

  getFinancials: async (symbol) => {
    const response = await api.get(`/financials/${symbol}`);
    return response.data;
  },

  getSignals: async (symbol) => {
    const response = await api.get(`/signals/${symbol}`);
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/summary');
    return response.data;
  },

  getLastUpdatedDate: async () => {
    const response = await api.get('/stocks/last-updated');
    return response.data;
  },
};

export default api;