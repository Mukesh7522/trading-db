// src/pages/PortfolioPerformance.jsx - COMPLETE CODE WITH ALL FIXES
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, AlertTriangle, Target } from 'lucide-react';
import { stockAPI } from '../services/api';
import { formatPercent } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

const PortfolioPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('return_1y');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [returnsData, sectorsData] = await Promise.all([
        stockAPI.getReturns(),
        stockAPI.getSectors()
      ]);
      setReturns(returnsData);
      setSectors(sectorsData);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const periods = [
    { label: '1 Day', key: 'return_1d' },
    { label: '1 Week', key: 'return_1w' },
    { label: '1 Month', key: 'return_1m' },
    { label: '3 Months', key: 'return_3m' },
    { label: '6 Months', key: 'return_6m' },
    { label: '1 Year', key: 'return_1y' },
  ];

  // Calculate portfolio metrics
  const avgReturn = returns.reduce((sum, s) => sum + parseFloat(s[selectedPeriod] || 0), 0) / returns.length;
  const avgVolatility = returns.reduce((sum, s) => sum + parseFloat(s.volatility_30d || 0), 0) / returns.length;
  const avgSharpe = returns.reduce((sum, s) => sum + parseFloat(s.sharpe_ratio || 0), 0) / returns.length;

  const bestPerformer = [...returns].sort((a, b) => 
    parseFloat(b[selectedPeriod]) - parseFloat(a[selectedPeriod])
  )[0];

  const worstPerformer = [...returns].sort((a, b) => 
    parseFloat(a[selectedPeriod]) - parseFloat(b[selectedPeriod])
  )[0];

  // Prepare chart data - TOP 10 PERFORMERS
  const returnsChartData = returns
    .sort((a, b) => parseFloat(b[selectedPeriod]) - parseFloat(a[selectedPeriod]))
    .slice(0, 10)
    .map(r => ({
      symbol: r.symbol,
      return: parseFloat(r[selectedPeriod]) * 100,
      color: parseFloat(r[selectedPeriod]) >= 0 ? '#10b981' : '#ef4444'
    }));

  const riskReturnData = returns.map(r => ({
    symbol: r.symbol,
    risk: parseFloat(r.volatility_30d) * 100,
    return: parseFloat(r[selectedPeriod]) * 100,
    sharpe: parseFloat(r.sharpe_ratio)
  }));

  const sectorReturnsData = sectors.map(s => ({
    sector: s.sector,
    change: parseFloat(s.avg_price_change),
    stocks: s.num_stocks
  }));

  // Custom function to wrap long sector names into multiple lines - FIX FOR SECTOR LABELS
  const CustomXAxisTick = (props) => {
    const { x, y, payload } = props;
    const text = payload.value;
    const words = text.split(' ');

    // If sector name has more than 2 words or is very long, split into multiple lines
    if (words.length > 2 || text.length > 15) {
      const midpoint = Math.ceil(words.length / 2);
      const firstLine = words.slice(0, midpoint).join(' ');
      const secondLine = words.slice(midpoint).join(' ');

      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} textAnchor="middle" fill="#9ca3af" fontSize={11}>
            {firstLine}
          </text>
          <text x={0} y={0} dy={28} textAnchor="middle" fill="#9ca3af" fontSize={11}>
            {secondLine}
          </text>
        </g>
      );
    } else if (words.length === 2) {
      // For 2-word sectors, keep on same line if short enough
      if (text.length <= 15) {
        return (
          <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#9ca3af" fontSize={11}>
              {text}
            </text>
          </g>
        );
      } else {
        // Split into 2 lines
        return (
          <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#9ca3af" fontSize={11}>
              {words[0]}
            </text>
            <text x={0} y={0} dy={28} textAnchor="middle" fill="#9ca3af" fontSize={11}>
              {words[1]}
            </text>
          </g>
        );
      }
    } else {
      // Single word or short text
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} textAnchor="middle" fill="#9ca3af" fontSize={11}>
            {text}
          </text>
        </g>
      );
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Portfolio Performance</h1>
        <p className="text-gray-400">Track returns, risk, and sector allocation</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard 
          icon={<TrendingUp />} 
          label="Avg Return" 
          value={formatPercent(avgReturn * 100)} 
          color={avgReturn >= 0 ? 'green' : 'red'}
        />
        <SummaryCard 
          icon={<AlertTriangle />} 
          label="Avg Volatility" 
          value={formatPercent(avgVolatility * 100)} 
          color="yellow"
        />
        <SummaryCard 
          icon={<Target />} 
          label="Avg Sharpe" 
          value={avgSharpe.toFixed(2)} 
          color="blue"
        />
        <SummaryCard 
          icon={<Award />} 
          label="Best Performer" 
          value={bestPerformer?.symbol || 'N/A'}
          subtitle={formatPercent(parseFloat(bestPerformer?.[selectedPeriod] || 0) * 100)}
          color="green"
        />
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setSelectedPeriod(p.key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedPeriod === p.key
                ? 'bg-green-500 text-white'
                : 'bg-dark-elevated hover:bg-dark-border text-gray-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Top Performers Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-elevated rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">Top 10 Performers</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={returnsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--bar-color)" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="var(--bar-color)" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="symbol" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
              formatter={(value) => [`${value.toFixed(2)}%`, 'Return']}
              cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
            />
            <Bar 
              dataKey="return" 
              radius={[8, 8, 0, 0]}
              animationDuration={500}
            >
              {returnsChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ '--bar-color': entry.color }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk vs Return Scatter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-elevated rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">Risk vs Return Analysis</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              type="number" 
              dataKey="risk" 
              name="Risk" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Volatility (%)', position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
            />
            <YAxis 
              type="number" 
              dataKey="return" 
              name="Return" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
              formatter={(value, name) => [
                `${value.toFixed(2)}%`,
                name === 'risk' ? 'Risk' : 'Return'
              ]}
              cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
            />
            <Scatter 
              data={riskReturnData} 
              fill="#8884d8"
              animationDuration={400}
            >
              {riskReturnData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.return >= 0 ? '#10b981' : '#ef4444'} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Sector Performance - FIXED: Reduced gap */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-elevated rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">Sector Performance</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sectorReturnsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="sectorPositiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.5}/>
              </linearGradient>
              <linearGradient id="sectorNegativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="sector" 
              stroke="#9ca3af"
              tick={<CustomXAxisTick />}
              interval={0}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
              formatter={(value) => [`${value.toFixed(2)}%`, 'Change']}
              cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
            />
            <Bar 
              dataKey="change" 
              radius={[8, 8, 0, 0]}
              animationDuration={500}
            >
              {sectorReturnsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.change >= 0 ? 'url(#sectorPositiveGradient)' : 'url(#sectorNegativeGradient)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Detailed Performance Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-elevated rounded-xl p-6 overflow-x-auto"
      >
        <h2 className="text-2xl font-semibold mb-4">Detailed Performance Metrics</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-4">Symbol</th>
              <th className="text-left py-3 px-4">Sector</th>
              <th className="text-right py-3 px-4">1D</th>
              <th className="text-right py-3 px-4">1W</th>
              <th className="text-right py-3 px-4">1M</th>
              <th className="text-right py-3 px-4">1Y</th>
              <th className="text-right py-3 px-4">Volatility</th>
              <th className="text-right py-3 px-4">Sharpe</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((stock, idx) => (
              <tr 
                key={idx}
                className="border-b border-dark-border hover:bg-dark-border transition-colors"
              >
                <td className="py-3 px-4 font-semibold">{stock.symbol}</td>
                <td className="py-3 px-4 text-gray-400">{stock.sector}</td>
                <td className="py-3 px-4 text-right">
                  <ReturnCell value={parseFloat(stock.return_1d) * 100} />
                </td>
                <td className="py-3 px-4 text-right">
                  <ReturnCell value={parseFloat(stock.return_1w) * 100} />
                </td>
                <td className="py-3 px-4 text-right">
                  <ReturnCell value={parseFloat(stock.return_1m) * 100} />
                </td>
                <td className="py-3 px-4 text-right">
                  <ReturnCell value={parseFloat(stock.return_1y) * 100} />
                </td>
                <td className="py-3 px-4 text-right text-yellow-500">
                  {formatPercent(parseFloat(stock.volatility_30d) * 100)}
                </td>
                <td className="py-3 px-4 text-right text-blue-500">
                  {parseFloat(stock.sharpe_ratio).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, subtitle, color }) => {
  const colorMap = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-6 relative overflow-hidden`}
    >
      <div className="relative z-10">
        <p className="text-sm text-gray-400 mb-2">{label}</p>
        <p className="text-3xl font-bold mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-300">{subtitle}</p>}
      </div>
      <div className="absolute top-4 right-4 opacity-20 text-6xl">
        {icon}
      </div>
    </motion.div>
  );
};

const ReturnCell = ({ value }) => {
  const color = value >= 0 ? 'text-green-500' : 'text-red-500';
  return (
    <span className={color}>
      {value >= 0 ? '+' : ''}{formatPercent(value)}
    </span>
  );
};

export default PortfolioPerformance;