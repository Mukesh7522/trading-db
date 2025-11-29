\# 📡 API Documentation



Base URL: `http://localhost:3001/api` (Development)  

Production: `https://your-backend.vercel.app/api`



---



\## 🏥 Health Check



\### Check Server Status



```http

GET /health

```



\*\*Response:\*\*

```json

{

&nbsp; "status": "OK",

&nbsp; "timestamp": "2025-11-30T10:30:00.000Z",

&nbsp; "database": "connected",

&nbsp; "dbTime": "2025-11-30T10:30:00.000Z"

}

```



---



\## 📊 Stock Data



\### Get All Stocks



```http

GET /api/stocks

```



\*\*Response:\*\* Array of stock objects

```json

\[

&nbsp; {

&nbsp;   "symbol": "AAPL",

&nbsp;   "company\_name": "Apple Inc.",

&nbsp;   "display\_name": "Apple Inc.",

&nbsp;   "sector": "Technology",

&nbsp;   "industry": "Consumer Electronics",

&nbsp;   "market\_cap": 2950000000000,

&nbsp;   "logo\_base64": "base64\_encoded\_image...",

&nbsp;   "updated\_date": "2025-11-30T10:30:00.000Z"

&nbsp; }

]

```



\### Get Real-Time Quotes



```http

GET /api/quotes

```



\*\*Response:\*\* Array of latest stock quotes

```json

\[

&nbsp; {

&nbsp;   "symbol": "AAPL",

&nbsp;   "current\_price": 189.95,

&nbsp;   "price\_change": 2.45,

&nbsp;   "change\_percent": 1.31,

&nbsp;   "volume": 45678900,

&nbsp;   "open": 187.50,

&nbsp;   "high": 190.20,

&nbsp;   "low": 186.80,

&nbsp;   "market\_cap": 2950000000000,

&nbsp;   "fetch\_timestamp": "2025-11-30T10:30:00.000Z"

&nbsp; }

]

```



\### Get Stock Details



```http

GET /api/stocks/:symbol

```



\*\*Parameters:\*\*

\- `symbol` (required): Stock symbol (e.g., AAPL)



\*\*Example:\*\*

```http

GET /api/stocks/AAPL

```



\*\*Response:\*\*

```json

{

&nbsp; "stock": {

&nbsp;   "symbol": "AAPL",

&nbsp;   "company\_name": "Apple Inc.",

&nbsp;   "sector": "Technology",

&nbsp;   "website": "https://www.apple.com"

&nbsp; },

&nbsp; "quote": {

&nbsp;   "current\_price": 189.95,

&nbsp;   "change\_percent": 1.31

&nbsp; },

&nbsp; "fundamentals": {

&nbsp;   "market\_cap": 2950000000000,

&nbsp;   "trailing\_pe": 28.5,

&nbsp;   "forward\_pe": 26.3

&nbsp; }

}

```



\### Get Historical Prices



```http

GET /api/prices/:symbol?period=1y

```



\*\*Parameters:\*\*

\- `symbol` (required): Stock symbol

\- `period` (optional): Time period

&nbsp; - `1w` - 1 week

&nbsp; - `1m` - 1 month

&nbsp; - `3m` - 3 months

&nbsp; - `6m` - 6 months

&nbsp; - `1y` - 1 year (default)

&nbsp; - `5y` - 5 years

&nbsp; - `all` - 10 years



\*\*Example:\*\*

```http

GET /api/prices/AAPL?period=3m

```



\*\*Response:\*\* Array of historical data

```json

\[

&nbsp; {

&nbsp;   "trading\_date": "2025-11-30",

&nbsp;   "open": 187.50,

&nbsp;   "high": 190.20,

&nbsp;   "low": 186.80,

&nbsp;   "close": 189.95,

&nbsp;   "volume": 45678900,

&nbsp;   "ma\_20": 185.30,

&nbsp;   "ma\_50": 182.15,

&nbsp;   "ma\_200": 175.60,

&nbsp;   "rsi\_14": 62.5,

&nbsp;   "macd": 2.45

&nbsp; }

]

```



\### Get Technical Indicators



```http

GET /api/indicators/:symbol

```



\*\*Example:\*\*

```http

GET /api/indicators/AAPL

```



\*\*Response:\*\* Last 100 days of technical indicators

```json

\[

&nbsp; {

&nbsp;   "trading\_date": "2025-11-30",

&nbsp;   "close": 189.95,

&nbsp;   "ma\_20": 185.30,

&nbsp;   "ma\_50": 182.15,

&nbsp;   "ma\_200": 175.60,

&nbsp;   "rsi\_14": 62.5,

&nbsp;   "macd": 2.45,

&nbsp;   "macd\_signal": 1.85,

&nbsp;   "macd\_histogram": 0.60,

&nbsp;   "bollinger\_upper": 195.20,

&nbsp;   "bollinger\_middle": 189.50,

&nbsp;   "bollinger\_lower": 183.80,

&nbsp;   "stochastic\_k": 68.5,

&nbsp;   "stochastic\_d": 65.2

&nbsp; }

]

```



---



\## 💰 Financial Data



\### Get Financial Statements



```http

GET /api/financials/:symbol

```



\*\*Example:\*\*

```http

GET /api/financials/AAPL

```



\*\*Response:\*\*

```json

{

&nbsp; "income": \[

&nbsp;   {

&nbsp;     "fiscal\_date": "2025-09-30",

&nbsp;     "period": "Quarterly",

&nbsp;     "total\_revenue": 89500000000,

&nbsp;     "gross\_profit": 40100000000,

&nbsp;     "operating\_income": 27800000000,

&nbsp;     "net\_income": 22950000000,

&nbsp;     "gross\_margin": 0.448,

&nbsp;     "operating\_margin": 0.311,

&nbsp;     "net\_margin": 0.256

&nbsp;   }

&nbsp; ],

&nbsp; "balance": \[

&nbsp;   {

&nbsp;     "fiscal\_date": "2025-09-30",

&nbsp;     "total\_assets": 352500000000,

&nbsp;     "total\_liabilities": 290100000000,

&nbsp;     "total\_equity": 62400000000,

&nbsp;     "cash\_and\_equivalents": 28600000000,

&nbsp;     "current\_ratio": 1.05,

&nbsp;     "debt\_to\_equity": 1.85

&nbsp;   }

&nbsp; ],

&nbsp; "cashflow": \[

&nbsp;   {

&nbsp;     "fiscal\_date": "2025-09-30",

&nbsp;     "operating\_cashflow": 29700000000,

&nbsp;     "investing\_cashflow": -2100000000,

&nbsp;     "financing\_cashflow": -28900000000,

&nbsp;     "free\_cashflow": 27150000000

&nbsp;   }

&nbsp; ]

}

```



---



\## 📈 Market Analysis



\### Get Sector Performance



```http

GET /api/sectors

```



\*\*Response:\*\*

```json

\[

&nbsp; {

&nbsp;   "sector": "Technology",

&nbsp;   "avg\_price\_change": 1.25,

&nbsp;   "avg\_market\_cap": 1500000000000,

&nbsp;   "total\_volume": 250000000,

&nbsp;   "num\_stocks": 8,

&nbsp;   "best\_performer": "NVDA",

&nbsp;   "worst\_performer": "INTC"

&nbsp; }

]

```



\### Get Portfolio Returns



```http

GET /api/returns

```



\*\*Response:\*\*

```json

\[

&nbsp; {

&nbsp;   "symbol": "AAPL",

&nbsp;   "display\_name": "Apple Inc.",

&nbsp;   "sector": "Technology",

&nbsp;   "return\_1d": 0.0131,

&nbsp;   "return\_1w": 0.0245,

&nbsp;   "return\_1m": 0.0587,

&nbsp;   "return\_3m": 0.1124,

&nbsp;   "return\_6m": 0.1856,

&nbsp;   "return\_1y": 0.3542,

&nbsp;   "volatility\_30d": 0.0245,

&nbsp;   "sharpe\_ratio": 1.85,

&nbsp;   "max\_drawdown": -0.1523

&nbsp; }

]

```



\### Get Market Summary



```http

GET /api/summary

```



\*\*Response:\*\*

```json

{

&nbsp; "stats": {

&nbsp;   "total\_stocks": 26,

&nbsp;   "total\_market\_cap": 15000000000000,

&nbsp;   "avg\_change": 0.85,

&nbsp;   "gainers": 18,

&nbsp;   "losers": 8

&nbsp; },

&nbsp; "topGainers": \[

&nbsp;   {

&nbsp;     "symbol": "NVDA",

&nbsp;     "company\_name": "NVIDIA Corporation",

&nbsp;     "current\_price": 495.50,

&nbsp;     "change\_percent": 3.25

&nbsp;   }

&nbsp; ],

&nbsp; "topLosers": \[

&nbsp;   {

&nbsp;     "symbol": "INTC",

&nbsp;     "company\_name": "Intel Corporation",

&nbsp;     "current\_price": 42.15,

&nbsp;     "change\_percent": -2.15

&nbsp;   }

&nbsp; ]

}

```



---



\## 🎯 Trading Signals



\### Get Trading Signals



```http

GET /api/signals/:symbol

```



\*\*Example:\*\*

```http

GET /api/signals/AAPL

```



\*\*Response:\*\* Last 20 trading signals

```json

\[

&nbsp; {

&nbsp;   "signal\_date": "2025-11-30",

&nbsp;   "signal\_type": "BUY",

&nbsp;   "signal\_reason": "RSI Oversold",

&nbsp;   "indicator\_value": 28.5

&nbsp; },

&nbsp; {

&nbsp;   "signal\_date": "2025-11-28",

&nbsp;   "signal\_type": "SELL",

&nbsp;   "signal\_reason": "MACD Bearish Crossover",

&nbsp;   "indicator\_value": -1.25

&nbsp; }

]

```



---



\## 🔧 Error Responses



All endpoints return appropriate HTTP status codes:



\### 200 OK

```json

{

&nbsp; "data": \[...]

}

```



\### 404 Not Found

```json

{

&nbsp; "error": "Stock not found"

}

```



\### 500 Internal Server Error

```json

{

&nbsp; "error": "Failed to fetch data",

&nbsp; "details": "Database connection timeout"

}

```



---



\## 📝 Request Examples



\### Using cURL



```bash

\# Get all stocks

curl http://localhost:3001/api/stocks



\# Get stock details

curl http://localhost:3001/api/stocks/AAPL



\# Get historical prices with period

curl "http://localhost:3001/api/prices/AAPL?period=3m"

```



\### Using JavaScript (Fetch)



```javascript

// Get market summary

const response = await fetch('http://localhost:3001/api/summary');

const data = await response.json();

console.log(data);



// Get stock details

const stockData = await fetch('http://localhost:3001/api/stocks/AAPL');

const stock = await stockData.json();

console.log(stock);

```



\### Using Axios



```javascript

import axios from 'axios';



// Get real-time quotes

const quotes = await axios.get('http://localhost:3001/api/quotes');

console.log(quotes.data);



// Get technical indicators

const indicators = await axios.get('http://localhost:3001/api/indicators/AAPL');

console.log(indicators.data);

```



---



\## 🚀 Rate Limiting



\- \*\*Development\*\*: No rate limiting

\- \*\*Production\*\*: 100 requests per minute per IP



---



\## 🔐 Authentication



Currently, the API is \*\*open\*\* and doesn't require authentication.



\*\*Future Enhancement\*\*: JWT-based authentication for protected endpoints.



---



\## 🆘 Support



For API issues or questions:

\- 📧 Email: Mukesh7522@gmail.com

\- 🐛 GitHub Issues: \[Report Issue](https://github.com/Mukesh7522/trading-db/issues)

