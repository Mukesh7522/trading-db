// src/components/StockCard.jsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent, formatVolume } from '../utils/formatters';

const StockCard = ({ stock, delay = 0 }) => {
  const isPositive = parseFloat(stock.change_percent) >= 0;
  
  // Generate logo placeholder with first 2 letters
  const getLogoPlaceholder = () => {
    return stock.symbol?.substring(0, 2) || 'ST';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-dark-surface rounded-xl p-4 border border-dark-border hover:border-blue-500/50 transition-all cursor-pointer"
    >
      {/* Header with Logo and Symbol */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Logo - Always show placeholder */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
            {getLogoPlaceholder()}
          </div>
          
          <div className="min-w-0">
            <h3 className="font-bold text-lg">{stock.symbol}</h3>
            <p className="text-xs text-gray-400 truncate max-w-[150px]">
              {stock.company_name || stock.display_name}
            </p>
          </div>
        </div>
        
        {/* Trend Icon */}
        <div className={`p-2 rounded-lg shrink-0 ${
          isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Price Information */}
      <div className="mb-3">
        <div className="flex items-end gap-2 mb-1">
          <p className="text-2xl font-bold">
            {formatCurrency(parseFloat(stock.current_price))}
          </p>
          <p className={`text-sm font-semibold ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? '+' : ''}{formatPercent(parseFloat(stock.change_percent))}
          </p>
        </div>
        <p className={`text-sm ${
          isPositive ? 'text-green-500/70' : 'text-red-500/70'
        }`}>
          {isPositive ? '+' : ''}{formatCurrency(parseFloat(stock.price_change))}
        </p>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dark-border">
        <div>
          <p className="text-xs text-gray-400">Volume</p>
          <p className="text-sm font-semibold">
            {formatVolume(stock.volume)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Market Cap</p>
          <p className="text-sm font-semibold">
            {formatMarketCap(parseInt(stock.market_cap))}
          </p>
        </div>
      </div>

      {/* Sector Badge */}
      {stock.sector && (
        <div className="mt-3">
          <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
            {stock.sector}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StockCard;