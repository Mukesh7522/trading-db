// src/components/StockCard.jsx - FIXED LOGO DISPLAY VERSION
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent, formatVolume, formatMarketCap } from '../utils/formatters';

const StockCard = ({ stock, delay = 0 }) => {
  const isPositive = parseFloat(stock.change_percent || 0) >= 0;

  const getLogoPlaceholder = () => {
    if (!stock?.symbol) return 'ST';
    const symbol = stock.symbol.toString().trim();
    return symbol.substring(0, Math.min(2, symbol.length)).toUpperCase();
  };

  const renderLogo = () => {
    // Check if logo_base64 exists and is valid
    if (stock.logo_base64 && stock.logo_base64.trim() !== '') {
      return (
        <>
          <img
            src={`data:image/png;base64,${stock.logo_base64}`}
            alt={`${stock.symbol} logo`}
            className="w-10 h-10 rounded-lg object-cover shadow-lg shrink-0"
            onError={(e) => {
              console.log(`Logo load failed for ${stock.symbol}, showing placeholder`);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
            onLoad={(e) => {
              console.log(`Logo loaded successfully for ${stock.symbol}`);
              e.target.nextSibling.style.display = 'none';
            }}
          />
          <div 
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg"
            style={{ display: 'none' }}
          >
            {getLogoPlaceholder()}
          </div>
        </>
      );
    }
    
    // No logo, show placeholder only
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
        {getLogoPlaceholder()}
      </div>
    );
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
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {renderLogo()}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg">{stock.symbol || 'N/A'}</h3>
            <p className="text-xs text-gray-400 truncate">
              {stock.display_name || stock.company_name || 'Unknown Company'}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-lg shrink-0 ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
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
            {formatCurrency(parseFloat(stock.current_price || 0))}
          </p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{formatPercent(parseFloat(stock.change_percent || 0))}
          </p>
        </div>
        <p className={`text-sm ${isPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>
          {isPositive ? '+' : ''}{formatCurrency(parseFloat(stock.price_change || 0))}
        </p>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dark-border">
        <div>
          <p className="text-xs text-gray-400">Volume</p>
          <p className="text-sm font-semibold">{formatVolume(stock.volume || 0)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Market Cap</p>
          <p className="text-sm font-semibold">{formatMarketCap(parseInt(stock.market_cap || 0))}</p>
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