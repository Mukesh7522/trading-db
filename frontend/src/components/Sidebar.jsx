// src/components/Sidebar.jsx - WITH UPDATE TIMES
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  FileText,
  Brain,
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart3,
  Clock,
  Calendar
} from 'lucide-react';
import { stockAPI } from '../services/api';

const Sidebar = ({ open, onToggle, selectedStock, onStockSelect }) => {
  const location = useLocation();
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [nextUpdate, setNextUpdate] = useState('');
  const [timeUntilUpdate, setTimeUntilUpdate] = useState('');

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    // Update countdown every minute
    const interval = setInterval(() => {
      calculateNextUpdate();
    }, 60000); // Update every minute

    calculateNextUpdate(); // Initial calculation

    return () => clearInterval(interval);
  }, []);

  const loadStocks = async () => {
    try {
      const data = await stockAPI.getAllStocks();
      setStocks(data);
      
      // Fetch the last updated date from dim_stocks table
      try {
        const lastUpdatedData = await stockAPI.getLastUpdatedDate();
        
        if (lastUpdatedData?.last_updated_date) {
          const dbTimestamp = lastUpdatedData.last_updated_date;
          console.log('📅 Last updated date from API:', dbTimestamp);
          
          // Parse the timestamp from database
          // The timestamp from PostgreSQL is stored in UTC (database server timezone)
          // We need to convert it to IST (UTC+5:30) for display
          const date = new Date(dbTimestamp);
          
          console.log('📅 Parsed date object (UTC):', date.toUTCString());
          
          if (!isNaN(date.getTime())) {
            // Convert UTC to IST (UTC + 5:30)
            const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
            const istDate = new Date(date.getTime() + istOffset);
            
            console.log('📅 Date in IST:', istDate.toUTCString());
            
            // Format date in IST for display
            // Format: "Nov 29, 2025 at 9:24 AM" (in IST, no timezone suffix)
            const formattedDate = istDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC' // Use UTC since we already converted manually
            });
            
            const formattedTime = istDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'UTC' // Use UTC since we already converted manually
            });
            
            const finalText = `${formattedDate} at ${formattedTime}`;
            console.log('✅ Last Updated Text (IST):', finalText);
            setLastUpdated(finalText);
          } else {
            console.error('Invalid date created from:', dbTimestamp);
          }
        } else {
          console.warn('⚠️ No last_updated_date found');
        }
      } catch (err) {
        console.error('Error fetching last updated date:', err);
      }

      calculateNextUpdate();
    } catch (err) {
      console.error('Error loading stocks:', err);
    }
  };

  const calculateNextUpdate = () => {
    const now = new Date();
    
    // Set next update time to 9:00 AM in local timezone
    let nextUpdateTime = new Date(now);
    nextUpdateTime.setHours(9, 0, 0, 0);
    
    // If current time is past 9 AM, set to next day
    if (now.getHours() >= 9 || (now.getHours() === 9 && now.getMinutes() > 0)) {
      nextUpdateTime.setDate(nextUpdateTime.getDate() + 1);
    }
    
    // Format next update date using browser's locale
    const nextUpdateFormatted = nextUpdateTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const nextUpdateTimeFormatted = nextUpdateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    setNextUpdate(`${nextUpdateFormatted} at ${nextUpdateTimeFormatted}`);
    
    // Calculate time remaining
    const timeRemaining = nextUpdateTime - now;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursRemaining > 0) {
      setTimeUntilUpdate(`in ${hoursRemaining}h ${minutesRemaining}m`);
    } else if (minutesRemaining > 0) {
      setTimeUntilUpdate(`in ${minutesRemaining}m`);
    } else {
      setTimeUntilUpdate('updating soon...');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Market Overview', path: '/' },
    { icon: TrendingUp, label: 'Stock Analysis', path: '/analysis' },
    { icon: PieChart, label: 'Portfolio', path: '/portfolio' },
    { icon: FileText, label: 'Financials', path: '/financials' },
    { icon: Brain, label: 'Forecasting', path: '/forecast' },
  ];

  const filteredStocks = stocks.filter(s =>
    s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 256 : 80 }}
      className="fixed left-0 top-0 h-screen bg-dark-surface border-r border-dark-border z-50 flex flex-col"
    >
      {/* Header with Logo */}
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Stock Dashboard
              </h1>
              <p className="text-xs text-gray-400">Real-time Analytics</p>
            </div>
          </motion.div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-dark-elevated rounded-lg transition-colors shrink-0"
        >
          {open ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-dark-elevated text-gray-400'
                  }`}
                  title={!open ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <p className="text-sm font-semibold text-gray-400 mb-3 px-2">Select Stock</p>
            
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => onStockSelect(stock.symbol)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedStock === stock.symbol
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'hover:bg-dark-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Logo with fallback */}
                      {stock.logo_base64 ? (
                        <>
                          <img
                            src={`data:image/png;base64,${stock.logo_base64}`}
                            alt={`${stock.symbol} logo`}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                              e.target.nextSibling.style.display = 'none';
                            }}
                          />
                          <div 
                            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ display: 'none' }}
                          >
                            {stock.symbol?.substring(0, 2)}
                          </div>
                        </>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {stock.symbol?.substring(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{stock.symbol}</p>
                        <p className="text-xs text-gray-400 truncate">{stock.company_name}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredStocks.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No stocks found</p>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Footer - WITH UPDATE TIMES */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-dark-border space-y-3"
        >
          {/* Last Updated */}
          {lastUpdated && (
            <div className="bg-dark-elevated rounded-lg p-3 border border-dark-border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3.5 h-3.5 text-green-400" />
                <p className="text-xs font-semibold text-green-400">Last Updated</p>
              </div>
              <p className="text-xs text-gray-300 font-medium">
                {lastUpdated}
              </p>
            </div>
          )}

          {/* Next Update */}
          {nextUpdate && (
            <div className="bg-dark-elevated rounded-lg p-3 border border-dark-border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-xs font-semibold text-blue-400">Next Update</p>
              </div>
              <p className="text-xs text-gray-300 font-medium">
                {nextUpdate}
              </p>
              {timeUntilUpdate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {timeUntilUpdate}
                </p>
              )}
            </div>
          )}

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center pt-2">
            © 2025 Stock Dashboard
          </p>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;