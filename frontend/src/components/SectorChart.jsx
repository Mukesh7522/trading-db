// src/components/SectorChart.jsx - MATCHING PORTFOLIO PERFORMANCE FORMAT
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SectorChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No sector data available
      </div>
    );
  }

  // Sort by performance
  const sortedData = [...data].sort((a, b) => 
    parseFloat(b.avg_price_change) - parseFloat(a.avg_price_change)
  );

  // Custom X-Axis Tick with multi-line support - MATCHING PORTFOLIO PERFORMANCE
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
          <text 
            x={0} 
            y={0} 
            dy={16} 
            textAnchor="middle" 
            fill="#94a3b8"
            fontSize={11}
            fontWeight={500}
          >
            {firstLine}
          </text>
          <text 
            x={0} 
            y={0} 
            dy={30} 
            textAnchor="middle" 
            fill="#94a3b8"
            fontSize={11}
            fontWeight={500}
          >
            {secondLine}
          </text>
        </g>
      );
    } else if (words.length === 2) {
      // For 2-word sectors, keep on same line if short enough
      if (text.length <= 15) {
        return (
          <g transform={`translate(${x},${y})`}>
            <text 
              x={0} 
              y={0} 
              dy={20} 
              textAnchor="middle" 
              fill="#94a3b8"
              fontSize={11}
              fontWeight={500}
            >
              {text}
            </text>
          </g>
        );
      } else {
        // Split into 2 lines
        return (
          <g transform={`translate(${x},${y})`}>
            <text 
              x={0} 
              y={0} 
              dy={16} 
              textAnchor="middle" 
              fill="#94a3b8"
              fontSize={11}
              fontWeight={500}
            >
              {words[0]}
            </text>
            <text 
              x={0} 
              y={0} 
              dy={30} 
              textAnchor="middle" 
              fill="#94a3b8"
              fontSize={11}
              fontWeight={500}
            >
              {words[1]}
            </text>
          </g>
        );
      }
    } else {
      // Single word or short text
      return (
        <g transform={`translate(${x},${y})`}>
          <text 
            x={0} 
            y={0} 
            dy={20} 
            textAnchor="middle" 
            fill="#94a3b8"
            fontSize={11}
            fontWeight={500}
          >
            {text}
          </text>
        </g>
      );
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const change = parseFloat(data.avg_price_change);
      const isPositive = change >= 0;

      return (
        <div className="bg-dark-elevated border border-dark-border rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <p className="font-semibold mb-3 text-lg">{data.sector}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4 items-center">
              <span className="text-gray-400">Avg Change:</span>
              <span className={`font-bold text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Stocks:</span>
              <span className="font-medium">{data.num_stocks}</span>
            </div>
            {data.best_performer && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Best:</span>
                <span className="text-green-400 font-medium">{data.best_performer}</span>
              </div>
            )}
            {data.worst_performer && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Worst:</span>
                <span className="text-red-400 font-medium">{data.worst_performer}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare chart data - matching Portfolio Performance format
  const chartData = sortedData.map(s => ({
    sector: s.sector,
    change: parseFloat(s.avg_price_change),
    stocks: s.num_stocks,
    best_performer: s.best_performer,
    worst_performer: s.worst_performer
  }));

  return (
    <div className="space-y-4">
      {/* Chart - MATCHING PORTFOLIO PERFORMANCE STYLE */}
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={380} minWidth={600}>
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.5}/>
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="sector" 
              stroke="#94a3b8"
              height={70}
              interval={0}
              tick={<CustomXAxisTick />}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              label={{ 
                value: 'Change (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#94a3b8' }
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
            />
            <Bar 
              dataKey="change" 
              radius={[8, 8, 0, 0]}
              animationDuration={500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.change >= 0 ? 'url(#positiveGradient)' : 'url(#negativeGradient)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedData.map((sector, idx) => {
          const change = parseFloat(sector.avg_price_change);
          const isPositive = change >= 0;
          
          return (
            <motion.div
              key={sector.sector}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg border ${
                isPositive 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{sector.sector}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {sector.num_stocks} stocks
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-bold ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {sector.best_performer && (
                    <div>Best: <span className="text-green-400">{sector.best_performer}</span></div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SectorChart;