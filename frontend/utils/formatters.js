// src/utils/formatters.js - COMPLETE VERSION WITH ALL FUNCTIONS

/**
 * Format number as currency (USD)
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format number with commas
 * @param {number} value - The number to format
 * @returns {string} Formatted number string (e.g., "1,234,567")
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format number as percentage
 * @param {number} value - The number to format
 * @returns {string} Formatted percentage string (e.g., "12.34%")
 */
export const formatPercent = (value) => {
  if (!value && value !== 0) return '0.00%';
  return `${parseFloat(value).toFixed(2)}%`;
};

/**
 * Format large numbers as market cap (with T, B, M, K suffixes)
 * @param {number} value - The number to format
 * @returns {string} Formatted market cap string (e.g., "$1.23T", "$456.78B")
 */
export const formatMarketCap = (value) => {
  if (!value && value !== 0) return '$0';
  const numValue = parseFloat(value);
  
  if (numValue >= 1e12) return `$${(numValue / 1e12).toFixed(2)}T`;
  if (numValue >= 1e9) return `$${(numValue / 1e9).toFixed(2)}B`;
  if (numValue >= 1e6) return `$${(numValue / 1e6).toFixed(2)}M`;
  if (numValue >= 1e3) return `$${(numValue / 1e3).toFixed(2)}K`;
  return `$${numValue.toFixed(2)}`;
};

/**
 * Format volume with B, M, K suffixes
 * @param {number} value - The volume to format
 * @returns {string} Formatted volume string (e.g., "1.23B", "456.78M")
 */
export const formatVolume = (value) => {
  if (!value && value !== 0) return '0';
  const numValue = parseInt(value);
  
  if (numValue >= 1e9) return `${(numValue / 1e9).toFixed(2)}B`;
  if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(2)}M`;
  if (numValue >= 1e3) return `${(numValue / 1e3).toFixed(2)}K`;
  return numValue.toString();
};

/**
 * Format date to readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Nov 18, 2025")
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format date to short string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Nov 18")
 */
export const formatDateShort = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format number with + or - sign for changes
 * @param {number} value - The number to format
 * @returns {string} Formatted change string (e.g., "+12.34", "-5.67")
 */
export const formatChange = (value) => {
  if (!value && value !== 0) return '0.00';
  const numValue = parseFloat(value);
  const sign = numValue >= 0 ? '+' : '';
  return `${sign}${numValue.toFixed(2)}`;
};

/**
 * Format number with + or - sign as percentage
 * @param {number} value - The number to format
 * @returns {string} Formatted change percentage (e.g., "+12.34%", "-5.67%")
 */
export const formatChangePercent = (value) => {
  if (!value && value !== 0) return '0.00%';
  const numValue = parseFloat(value);
  const sign = numValue >= 0 ? '+' : '';
  return `${sign}${numValue.toFixed(2)}%`;
};

/**
 * Shorten large numbers for display
 * @param {number} value - The number to shorten
 * @returns {string} Shortened number (e.g., "1.2M", "345K")
 */
export const shortenNumber = (value) => {
  if (!value && value !== 0) return '0';
  const numValue = parseFloat(value);
  
  if (Math.abs(numValue) >= 1e9) return `${(numValue / 1e9).toFixed(1)}B`;
  if (Math.abs(numValue) >= 1e6) return `${(numValue / 1e6).toFixed(1)}M`;
  if (Math.abs(numValue) >= 1e3) return `${(numValue / 1e3).toFixed(1)}K`;
  return numValue.toFixed(0);
};

/**
 * Check if a value is positive, negative, or neutral
 * @param {number} value - The value to check
 * @returns {string} 'positive', 'negative', or 'neutral'
 */
export const getChangeDirection = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return 'positive';
  if (numValue < 0) return 'negative';
  return 'neutral';
};

/**
 * Get color class based on value (for Tailwind CSS)
 * @param {number} value - The value to check
 * @returns {string} Tailwind color class
 */
export const getChangeColor = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return 'text-green-500';
  if (numValue < 0) return 'text-red-500';
  return 'text-gray-400';
};

/**
 * Get background color class based on value (for Tailwind CSS)
 * @param {number} value - The value to check
 * @returns {string} Tailwind background color class
 */
export const getChangeBgColor = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return 'bg-green-500/20';
  if (numValue < 0) return 'bg-red-500/20';
  return 'bg-gray-500/20';
};