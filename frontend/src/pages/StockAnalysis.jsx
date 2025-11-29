// src/pages/StockAnalysis.jsx - COMPLETE FIXED VERSION
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, AlertCircle, Calendar } from 'lucide-react';
import { stockAPI } from '../services/api';
import { formatCurrency, formatPercent, formatVolume } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const StockAnalysis = ({ stock = 'AAPL' }) => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1y');
  const [stockDetails, setStockDetails] = useState(null);
  const [prices, setPrices] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    loadStockData();
  }, [stock, period]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      const [details, priceData, indicatorData, signalData, allStocks] = await Promise.all([
        stockAPI.getStockDetails(stock),
        stockAPI.getPrices(stock, period),
        stockAPI.getIndicators(stock),
        stockAPI.getSignals(stock),
        stockAPI.getAllStocks().catch(() => [])
      ]);

      // Merge logo data
      const stockWithLogo = allStocks.find(s => s.symbol === stock);
      const detailsWithLogo = {
        ...details,
        stock: {
          ...details.stock,
          logo_base64: stockWithLogo?.logo_base64 || details.stock?.logo_base64
        }
      };

      setStockDetails(detailsWithLogo);
      setPrices(priceData);
      setIndicators(indicatorData);
      setSignals(signalData);
    } catch (err) {
      console.error('Error loading stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const stockInfo = stockDetails?.stock || {};
  const quote = stockDetails?.quote || {};

  // Smart date formatting - only show first occurrence of each month
  const formatChartData = (data) => {
    const seenMonths = new Set();
    
    return data.map((p, index) => {
      const date = new Date(p.trading_date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthYearKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      // Show label only for first occurrence of each month
      const showLabel = !seenMonths.has(monthYearKey);
      if (showLabel) {
        seenMonths.add(monthYearKey);
      }
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        monthYear: monthYear,
        displayLabel: showLabel ? monthYear : '',
        timestamp: date.getTime(),
        price: parseFloat(p.close),
        ma20: parseFloat(p.ma_20),
        ma50: parseFloat(p.ma_50),
        volume: parseInt(p.volume)
      };
    });
  };

  // Format data for charts
  const priceChartData = formatChartData(prices);

  const rsiData = indicators.slice(0, 30).reverse().map((i, index, arr) => {
    const date = new Date(i.trading_date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    const prevItem = index > 0 ? arr[index - 1] : null;
    const prevMonthYear = prevItem ? new Date(prevItem.trading_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : null;
    const showLabel = !prevMonthYear || prevMonthYear !== monthYear;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      monthYear: monthYear,
      displayLabel: showLabel ? monthYear : '',
      rsi: parseFloat(i.rsi_14)
    };
  });

  const macdData = indicators.slice(0, 30).reverse().map((i, index, arr) => {
    const date = new Date(i.trading_date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    const prevItem = index > 0 ? arr[index - 1] : null;
    const prevMonthYear = prevItem ? new Date(prevItem.trading_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : null;
    const showLabel = !prevMonthYear || prevMonthYear !== monthYear;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      monthYear: monthYear,
      displayLabel: showLabel ? monthYear : '',
      macd: parseFloat(i.macd),
      signal: parseFloat(i.macd_signal),
      histogram: parseFloat(i.macd_histogram)
    };
  });

  const periods = [
    { label: '1W', value: '1w' },
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
  ];

  // Calculate minimum width for scrollable charts based on number of unique months
  const calculateMinWidth = (data) => {
    const uniqueMonths = new Set(data.map(d => d.monthYear)).size;
    const pixelsPerMonth = 80; // Space per month label
    return Math.max(800, uniqueMonths * pixelsPerMonth);
  };

  const minChartWidth = calculateMinWidth(priceChartData);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-between items-start gap-4"
      >
        <div>
          <div className="flex items-center gap-4">
            {/* Logo with fallback */}
            {stockInfo.logo_base64 ? (
              <>
                <img
                  src={`data:image/png;base64,${stockInfo.logo_base64}`}
                  alt={`${stock} logo`}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg shrink-0"
                  onError={(e) => {
                    console.log(`Logo failed for ${stock}, showing placeholder`);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    console.log(`Logo loaded for ${stock}`);
                    e.target.nextSibling.style.display = 'none';
                  }}
                />
                <div 
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0"
                  style={{ display: 'none' }}
                >
                  {stock?.substring(0, 2)}
                </div>
              </>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0">
                {stock?.substring(0, 2)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{stock}</h1>
              <p className="text-gray-400">{stockInfo.company_name || 'Loading...'}</p>
            </div>
            {stockInfo.sector && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                {stockInfo.sector}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{formatCurrency(quote.current_price || 0)}</p>
          <p className={`text-lg ${parseFloat(quote.change_percent || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(quote.change_percent || 0) >= 0 ? '+' : ''}
            {formatPercent(parseFloat(quote.change_percent || 0))}
          </p>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Open" value={formatCurrency(quote.open || 0)} />
        <MetricCard label="High" value={formatCurrency(quote.high || 0)} />
        <MetricCard label="Low" value={formatCurrency(quote.low || 0)} />
        <MetricCard label="Volume" value={formatVolume(quote.volume || 0)} />
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 flex-wrap">
        {periods.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              period === p.value
                ? 'bg-blue-500 text-white'
                : 'bg-dark-elevated hover:bg-dark-border text-gray-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Price Chart - SCROLLABLE with MONTHLY LABELS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-surface rounded-xl p-6 border border-dark-border"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Price & Moving Averages
        </h2>
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${minChartWidth}px` }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={priceChartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="displayLabel" 
                  stroke="#94a3b8" 
                  interval={0}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  height={60}
                  angle={0}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'volume') return formatVolume(value);
                    return formatCurrency(value);
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false} 
                  name="Price"
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }}
                  animationDuration={300}
                />
                <Line 
                  type="monotone" 
                  dataKey="ma20" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false} 
                  name="MA 20"
                  strokeDasharray="5 5"
                  animationDuration={400}
                />
                <Line 
                  type="monotone" 
                  dataKey="ma50" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={false} 
                  name="MA 50"
                  strokeDasharray="5 5"
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {priceChartData.length > 100 && (
          <p className="text-xs text-gray-500 text-center mt-2 italic">
            💡 Scroll horizontally to view all data • {priceChartData.length} trading days
          </p>
        )}
      </motion.div>

      {/* Volume Chart - SCROLLABLE with MONTHLY LABELS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-surface rounded-xl p-6 border border-dark-border"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          Volume
        </h2>
        <div className="overflow-x-auto">
          <div style={{ minWidth: `${minChartWidth}px` }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceChartData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="displayLabel" 
                  stroke="#94a3b8"
                  angle={0}
                  textAnchor="middle"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(value) => formatVolume(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                  }}
                  formatter={(value) => [formatVolume(value), 'Volume']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Bar 
                  dataKey="volume" 
                  fill="url(#volumeGradient)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={400}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {priceChartData.length > 100 && (
          <p className="text-xs text-gray-500 text-center mt-2 italic">
            💡 Scroll horizontally to view all volume data
          </p>
        )}
      </motion.div>

      {/* Technical Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSI */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-surface rounded-xl p-6 border border-dark-border"
        >
          <h2 className="text-xl font-semibold mb-4">RSI (14)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={rsiData}>
              <defs>
                <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="displayLabel" 
                stroke="#94a3b8" 
                interval={0}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                height={60}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="rsi" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#rsiGradient)" 
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Oversold (&lt;30)</span>
            <span>Overbought (&gt;70)</span>
          </div>
        </motion.div>

        {/* MACD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-surface rounded-xl p-6 border border-dark-border"
        >
          <h2 className="text-xl font-semibold mb-4">MACD</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={macdData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="displayLabel" 
                stroke="#94a3b8" 
                interval={0}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                height={60}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return label;
                }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="macd" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false} 
                name="MACD"
                activeDot={{ r: 5, fill: '#3b82f6' }}
                animationDuration={400}
              />
              <Line 
                type="monotone" 
                dataKey="signal" 
                stroke="#f59e0b" 
                strokeWidth={2.5} 
                dot={false} 
                name="Signal"
                strokeDasharray="5 5"
                activeDot={{ r: 5, fill: '#f59e0b' }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Trading Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-surface rounded-xl p-6 border border-dark-border"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          Recent Trading Signals
        </h2>
        {signals && signals.length > 0 ? (
          <div className="space-y-3">
            {signals.slice(0, 10).map((signal, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 rounded-lg ${
                  signal.signal_type === 'BUY'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    signal.signal_type === 'BUY' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {signal.signal_type}
                  </span>
                  <span className="text-sm sm:text-base">{signal.signal_reason}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(signal.signal_date).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No trading signals available
          </div>
        )}
      </motion.div>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="bg-dark-surface rounded-lg p-4 border border-dark-border">
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default StockAnalysis;