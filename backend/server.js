// backend/server.js - COMPLETE FIXED VERSION

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    console.log('CORS rejected origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ============================================
// DATABASE CONNECTION
// ============================================

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// ============================================
// HEALTH CHECK ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Stock Dashboard API is running!',
    status: 'OK',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      database: 'connected',
      dbTime: result.rows[0].now
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// ============================================
// API ROUTES
// ============================================

// 1. GET ALL STOCKS - FIXED WITH updated_date
app.get('/api/stocks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        symbol, 
        company_name, 
        display_name, 
        sector, 
        industry, 
        market_cap, 
        logo_base64,
        updated_date
      FROM dim_stocks
      ORDER BY symbol
    `);
    
    console.log(`✅ Fetched ${result.rows.length} stocks`);
    if (result.rows.length > 0) {
      console.log(`📅 Sample updated_date:`, result.rows[0].updated_date);
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stocks:', err);
    res.status(500).json({ error: 'Failed to fetch stocks', details: err.message });
  }
});

// 1.1. GET LAST UPDATED DATE FROM dim_stocks
app.get('/api/stocks/last-updated', async (req, res) => {
  try {
    // Get the MAX updated_date from dim_stocks and format it using PostgreSQL
    // This ensures we get the exact timestamp as stored, formatted consistently
    const result = await pool.query(`
      SELECT 
        MAX(updated_date) as last_updated_date,
        TO_CHAR(MAX(updated_date), 'YYYY-MM-DD"T"HH24:MI:SS') as formatted_timestamp
      FROM dim_stocks
    `);
    
    if (result.rows.length > 0 && result.rows[0].last_updated_date) {
      const dbTimestamp = result.rows[0].last_updated_date;
      const formattedTimestamp = result.rows[0].formatted_timestamp;
      
      console.log(`📅 Last updated date from dim_stocks (raw):`, dbTimestamp);
      console.log(`📅 Last updated date (formatted):`, formattedTimestamp);
      
      // Return the formatted timestamp string from PostgreSQL
      // This is the exact value as stored in the database (TIMESTAMP without timezone)
      // We'll append 'Z' to indicate it should be treated as UTC for display purposes
      // The frontend will display it in UTC to match the database value exactly
      const timestampForDisplay = formattedTimestamp + 'Z';
      
      console.log(`📅 Last updated date (for display):`, timestampForDisplay);
      
      res.json({ 
        last_updated_date: timestampForDisplay,
        raw_timestamp: dbTimestamp
      });
    } else {
      res.json({ last_updated_date: null });
    }
  } catch (err) {
    console.error('Error fetching last updated date:', err);
    res.status(500).json({ error: 'Failed to fetch last updated date', details: err.message });
  }
});

// 2. GET REAL-TIME QUOTES - FIXED TO SHOW ALL STOCKS
app.get('/api/quotes', async (req, res) => {
  try {
    // Get the latest quote for EACH stock (not just stocks from one timestamp)
    const result = await pool.query(`
      WITH LatestQuotes AS (
        SELECT 
          symbol,
          MAX(fetch_timestamp) as max_timestamp
        FROM fact_realtime_quotes
        GROUP BY symbol
      )
      SELECT 
        q.*,
        s.company_name,
        s.display_name,
        s.sector
      FROM fact_realtime_quotes q
      JOIN LatestQuotes lq ON q.symbol = lq.symbol AND q.fetch_timestamp = lq.max_timestamp
      JOIN dim_stocks s ON q.symbol = s.symbol
      ORDER BY q.market_cap DESC NULLS LAST
    `);
    
    console.log(`✅ Fetched ${result.rows.length} stock quotes`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ error: 'Failed to fetch quotes', details: err.message });
  }
});

// 3. GET STOCK DETAILS
app.get('/api/stocks/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const stock = await pool.query(
      'SELECT * FROM dim_stocks WHERE symbol = $1',
      [symbol.toUpperCase()]
    );
    
    if (stock.rows.length === 0) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    const quote = await pool.query(
      `SELECT * FROM fact_realtime_quotes 
       WHERE symbol = $1 
       ORDER BY fetch_timestamp DESC LIMIT 1`,
      [symbol.toUpperCase()]
    );
    
    const fundamentals = await pool.query(
      `SELECT * FROM fact_fundamentals 
       WHERE symbol = $1 
       ORDER BY updated_date DESC LIMIT 1`,
      [symbol.toUpperCase()]
    );
    
    res.json({
      stock: stock.rows[0],
      quote: quote.rows[0] || null,
      fundamentals: fundamentals.rows[0] || null
    });
  } catch (err) {
    console.error('Error fetching stock details:', err);
    res.status(500).json({ error: 'Failed to fetch stock details', details: err.message });
  }
});

// 4. GET HISTORICAL PRICES
app.get('/api/prices/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { period = '1y' } = req.query;
  
  const periodMap = {
    '1w': '7 days',
    '1m': '1 month',
    '3m': '3 months',
    '6m': '6 months',
    '1y': '1 year',
    '5y': '5 years',
    'all': '10 years'
  };
  
  const intervalValue = periodMap[period] || '1 year';
  
  try {
    const result = await pool.query(`
      SELECT trading_date, open, high, low, close, volume,
             ma_20, ma_50, ma_200, rsi_14, macd, bollinger_upper, bollinger_lower
      FROM fact_daily_prices
      WHERE symbol = $1 
        AND trading_date >= CURRENT_DATE - INTERVAL '${intervalValue}'
      ORDER BY trading_date ASC
    `, [symbol.toUpperCase()]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching prices:', err);
    res.status(500).json({ error: 'Failed to fetch prices', details: err.message });
  }
});

// 5. GET TECHNICAL INDICATORS
app.get('/api/indicators/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const result = await pool.query(`
      SELECT trading_date, close, ma_20, ma_50, ma_200,
             rsi_14, macd, macd_signal, macd_histogram,
             bollinger_upper, bollinger_middle, bollinger_lower,
             stochastic_k, stochastic_d, volume, avg_volume_20
      FROM fact_daily_prices
      WHERE symbol = $1
      ORDER BY trading_date DESC
      LIMIT 100
    `, [symbol.toUpperCase()]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching indicators:', err);
    res.status(500).json({ error: 'Failed to fetch indicators', details: err.message });
  }
});

// 6. GET SECTOR PERFORMANCE
app.get('/api/sectors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sector, avg_price_change, avg_market_cap, 
             total_volume, num_stocks, best_performer, worst_performer
      FROM fact_sector_performance
      WHERE calculation_date = (
        SELECT MAX(calculation_date) FROM fact_sector_performance
      )
      ORDER BY avg_price_change DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sectors:', err);
    res.status(500).json({ error: 'Failed to fetch sectors', details: err.message });
  }
});

// 7. GET PORTFOLIO RETURNS
app.get('/api/returns', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.symbol, s.display_name, s.sector,
             r.return_1d, r.return_1w, r.return_1m,
             r.return_3m, r.return_6m, r.return_1y,
             r.volatility_30d, r.sharpe_ratio, r.max_drawdown
      FROM fact_returns r
      JOIN dim_stocks s ON r.symbol = s.symbol
      WHERE r.calculation_date = (
        SELECT MAX(calculation_date) FROM fact_returns
      )
      ORDER BY r.return_1y DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching returns:', err);
    res.status(500).json({ error: 'Failed to fetch returns', details: err.message });
  }
});

// 8. GET FINANCIAL STATEMENTS
app.get('/api/financials/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const income = await pool.query(`
      SELECT * FROM fact_income_statement
      WHERE symbol = $1
      ORDER BY fiscal_date DESC
      LIMIT 8
    `, [symbol.toUpperCase()]);
    
    const balance = await pool.query(`
      SELECT * FROM fact_balance_sheet
      WHERE symbol = $1
      ORDER BY fiscal_date DESC
      LIMIT 8
    `, [symbol.toUpperCase()]);
    
    const cashflow = await pool.query(`
      SELECT * FROM fact_cash_flow
      WHERE symbol = $1
      ORDER BY fiscal_date DESC
      LIMIT 8
    `, [symbol.toUpperCase()]);
    
    res.json({
      income: income.rows,
      balance: balance.rows,
      cashflow: cashflow.rows
    });
  } catch (err) {
    console.error('Error fetching financials:', err);
    res.status(500).json({ error: 'Failed to fetch financials', details: err.message });
  }
});

// 9. GET TRADING SIGNALS
app.get('/api/signals/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const result = await pool.query(`
      SELECT * FROM fact_trading_signals
      WHERE symbol = $1
      ORDER BY signal_date DESC
      LIMIT 20
    `, [symbol.toUpperCase()]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching signals:', err);
    res.status(500).json({ error: 'Failed to fetch signals', details: err.message });
  }
});

// 10. GET MARKET SUMMARY
app.get('/api/summary', async (req, res) => {
  try {
    // Get stats from latest quotes for each stock
    const stats = await pool.query(`
      WITH LatestQuotes AS (
        SELECT 
          symbol,
          MAX(fetch_timestamp) as max_timestamp
        FROM fact_realtime_quotes
        GROUP BY symbol
      )
      SELECT 
        COUNT(*) as total_stocks,
        SUM(q.market_cap) as total_market_cap,
        AVG(q.change_percent) as avg_change,
        SUM(CASE WHEN q.change_percent > 0 THEN 1 ELSE 0 END) as gainers,
        SUM(CASE WHEN q.change_percent < 0 THEN 1 ELSE 0 END) as losers
      FROM fact_realtime_quotes q
      JOIN LatestQuotes lq ON q.symbol = lq.symbol AND q.fetch_timestamp = lq.max_timestamp
    `);
    
    const topGainers = await pool.query(`
      WITH LatestQuotes AS (
        SELECT 
          symbol,
          MAX(fetch_timestamp) as max_timestamp
        FROM fact_realtime_quotes
        GROUP BY symbol
      )
      SELECT q.symbol, s.company_name, q.current_price, q.change_percent
      FROM fact_realtime_quotes q
      JOIN LatestQuotes lq ON q.symbol = lq.symbol AND q.fetch_timestamp = lq.max_timestamp
      JOIN dim_stocks s ON q.symbol = s.symbol
      ORDER BY q.change_percent DESC
      LIMIT 5
    `);
    
    const topLosers = await pool.query(`
      WITH LatestQuotes AS (
        SELECT 
          symbol,
          MAX(fetch_timestamp) as max_timestamp
        FROM fact_realtime_quotes
        GROUP BY symbol
      )
      SELECT q.symbol, s.company_name, q.current_price, q.change_percent
      FROM fact_realtime_quotes q
      JOIN LatestQuotes lq ON q.symbol = lq.symbol AND q.fetch_timestamp = lq.max_timestamp
      JOIN dim_stocks s ON q.symbol = s.symbol
      ORDER BY q.change_percent ASC
      LIMIT 5
    `);
    
    res.json({
      stats: stats.rows[0],
      topGainers: topGainers.rows,
      topLosers: topLosers.rows
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Failed to fetch summary', details: err.message });
  }
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 API endpoints: http://localhost:${PORT}/api/*`);
  });
}

// Export for Vercel
module.exports = app;