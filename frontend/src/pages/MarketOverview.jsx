// src/pages/MarketOverview.jsx - FIXED LOGO DISPLAY VERSION
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { stockAPI } from '../services/api';
import StockCard from '../components/StockCard';
import SectorChart from '../components/SectorChart';
import LoadingSpinner from '../components/LoadingSpinner';

const MarketOverview = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Starting data load...');

      const [summaryData, quotesData, sectorsData, stocksData] = await Promise.all([
        stockAPI.getSummary().catch(err => {
          console.error('❌ Summary failed:', err);
          throw err;
        }),
        stockAPI.getQuotes().catch(err => {
          console.error('❌ Quotes failed:', err);
          throw err;
        }),
        stockAPI.getSectors().catch(err => {
          console.error('❌ Sectors failed:', err);
          throw err;
        }),
        stockAPI.getAllStocks().catch(err => {
          console.error('❌ Stocks failed:', err);
          return [];
        })
      ]);
      
      console.log('✅ Data loaded:', {
        summary: summaryData,
        quotes: quotesData?.length,
        sectors: sectorsData?.length,
        stocks: stocksData?.length
      });

      // Merge quotes with stock data (including logos)
      const quotesWithLogos = quotesData.map(quote => {
        const stockInfo = stocksData.find(s => s.symbol === quote.symbol);
        return {
          ...quote,
          logo_base64: stockInfo?.logo_base64 || null,
          company_name: quote.company_name || stockInfo?.company_name || quote.symbol,
          sector: quote.sector || stockInfo?.sector || 'Unknown'
        };
      });

      setSummary(summaryData);
      setQuotes(quotesWithLogos || []);
      setSectors(sectorsData || []);
    } catch (err) {
      console.error('❌ Error loading market data:', err);
      setError(err.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    console.log('⏳ Loading...');
    return <LoadingSpinner />;
  }

  if (error) {
    console.log('❌ Error state:', error);
    return (
      <div className="p-8 text-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Data</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = summary?.stats || {};
  const topGainers = summary?.topGainers || [];
  const topLosers = summary?.topLosers || [];

  console.log('✅ Rendering with data:', {
    statsKeys: Object.keys(stats),
    gainersCount: topGainers.length,
    losersCount: topLosers.length,
    quotesCount: quotes.length,
    sectorsCount: sectors.length
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Market Overview
          </h1>
          <p className="text-gray-400 mt-1">Real-time market data and analytics</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-dark-elevated hover:bg-dark-border rounded-lg transition-colors flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Total Stocks"
          value={stats.total_stocks || 0}
          color="blue"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Market Cap"
          value={`$${((stats.total_market_cap || 0) / 1e12).toFixed(2)}T`}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Gainers"
          value={stats.gainers || 0}
          color="green"
          subtitle={`${((stats.gainers / (stats.total_stocks || 1)) * 100 || 0).toFixed(1)}%`}
        />
        <StatCard
          icon={<TrendingDown className="w-6 h-6" />}
          label="Losers"
          value={stats.losers || 0}
          color="red"
          subtitle={`${((stats.losers / (stats.total_stocks || 1)) * 100 || 0).toFixed(1)}%`}
        />
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-surface rounded-xl p-6 border border-dark-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Top Gainers</h2>
          </div>
          {topGainers.length > 0 ? (
            <div className="space-y-3">
              {topGainers.map((stock, idx) => {
                const stockWithLogo = quotes.find(q => q.symbol === stock.symbol) || stock;
                return (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg hover:bg-dark-border transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {stockWithLogo.logo_base64 ? (
                        <>
                          <img
                            src={`data:image/png;base64,${stockWithLogo.logo_base64}`}
                            alt={`${stock.symbol} logo`}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                              e.target.nextSibling.style.display = 'none';
                            }}
                          />
                          <div 
                            className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ display: 'none' }}
                          >
                            {stock.symbol?.substring(0, 2)}
                          </div>
                        </>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {stock.symbol?.substring(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-sm text-gray-400 truncate">{stock.company_name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-semibold">${parseFloat(stock.current_price || 0).toFixed(2)}</p>
                      <p className="text-green-500 text-sm">
                        +{parseFloat(stock.change_percent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">No data available</p>
          )}
        </motion.div>

        {/* Top Losers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-surface rounded-xl p-6 border border-dark-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-semibold">Top Losers</h2>
          </div>
          {topLosers.length > 0 ? (
            <div className="space-y-3">
              {topLosers.map((stock, idx) => {
                const stockWithLogo = quotes.find(q => q.symbol === stock.symbol) || stock;
                return (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-between items-center p-3 bg-dark-elevated rounded-lg hover:bg-dark-border transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {stockWithLogo.logo_base64 ? (
                        <>
                          <img
                            src={`data:image/png;base64,${stockWithLogo.logo_base64}`}
                            alt={`${stock.symbol} logo`}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                              e.target.nextSibling.style.display = 'none';
                            }}
                          />
                          <div 
                            className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ display: 'none' }}
                          >
                            {stock.symbol?.substring(0, 2)}
                          </div>
                        </>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {stock.symbol?.substring(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{stock.symbol}</p>
                        <p className="text-sm text-gray-400 truncate">{stock.company_name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-semibold">${parseFloat(stock.current_price || 0).toFixed(2)}</p>
                      <p className="text-red-500 text-sm">
                        {parseFloat(stock.change_percent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">No data available</p>
          )}
        </motion.div>
      </div>

      {/* Sector Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-surface rounded-xl p-6 border border-dark-border"
      >
        <h2 className="text-xl font-semibold mb-4">Sector Performance</h2>
        <SectorChart data={sectors} />
      </motion.div>

      {/* All Stocks Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">All Stocks</h2>
        {quotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quotes.map((stock, idx) => (
              <StockCard key={stock.symbol} stock={stock} delay={idx * 0.05} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8 bg-dark-surface rounded-xl border border-dark-border">
            No stock data available
          </div>
        )}
      </motion.div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, subtitle }) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-6 hover:scale-105 transition-transform`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-${color}-500`}>{icon}</div>
      </div>
    </motion.div>
  );
};

export default MarketOverview;