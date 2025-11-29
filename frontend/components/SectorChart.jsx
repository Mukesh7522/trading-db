// src/components/SectorChart.jsx - COMPLETE FIX WITH HORIZONTAL LABELS
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

  // Find min and max values for proper domain with padding
  const values = sortedData.map(d => parseFloat(d.avg_price_change));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  // Add 15% padding to prevent bars from touching edges
  const range = maxValue - minValue;
  const padding = range * 0.15;
  const yMin = minValue - padding;
  const yMax = maxValue + padding;

  // Custom X-Axis Tick with HORIZONTAL multi-line wrapping
  const CustomXAxisTick = (props) => {
    const { x, y, payload } = props;
    const text = payload.value;
    
    // Split long sector names into multiple lines
    const words = text.split(' ');
    const lines = [];
    
    if (words.length === 1) {
      lines.push(text);
    } else if (words.length === 2) {
      // Two words - stack vertically
      lines.push(words[0]);
      lines.push(words[1]);
    } else {
      // Multiple words - balance across lines
      const mid = Math.ceil(words.length / 2);
      lines.push(words.slice(0, mid).join(' '));
      lines.push(words.slice(mid).join(' '));
    }
    
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text 
            key={index}
            x={0} 
            y={0} 
            dy={8 + (index * 13)} 
            textAnchor="middle" 
            fill="#94a3b8"
            fontSize={11}
            fontWeight={500}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const change = parseFloat(data.avg_price_change);
      const isPositive = change >= 0;

      return (
        <div className="bg-dark-elevated border border-dark-border rounded-lg p-4 shadow-xl">
          <p className="font-semibold mb-2">{data.sector}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Avg Change:</span>
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Stocks:</span>
              <span>{data.num_stocks}</span>
            </div>
            {data.best_performer && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Best:</span>
                <span className="text-green-400">{data.best_performer}</span>
              </div>
            )}
            {data.worst_performer && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-400">Worst:</span>
                <span className="text-red-400">{data.worst_performer}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Chart - HORIZONTAL multi-line labels with proper domain */}
      <ResponsiveContainer width="100%" height={480}>
        <BarChart 
          data={sortedData}
          margin={{ top: 20, right: 40, left: 40, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="sector" 
            stroke="#94a3b8" 
            height={65}
            interval={0}
            tick={<CustomXAxisTick />}
          />
          <YAxis 
            stroke="#94a3b8"
            label={{ 
              value: 'Change (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#94a3b8', fontSize: 12 }
            }}
            domain={[yMin, yMax]}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Bar 
            dataKey="avg_price_change" 
            radius={[8, 8, 0, 0]}
            maxBarSize={65}
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={parseFloat(entry.avg_price_change) >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

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