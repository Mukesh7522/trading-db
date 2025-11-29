// src/App.jsx - FIXED VERSION
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MarketOverview from './pages/MarketOverview';
import StockAnalysis from './pages/StockAnalysis';
import PortfolioPerformance from './pages/PortfolioPerformance';
import Financials from './pages/Financials';
import Forecasting from './pages/Forecasting';
import './App.css';

function App() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="flex h-screen bg-dark-bg text-white overflow-hidden">
        <Sidebar 
          open={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          selectedStock={selectedStock}
          onStockSelect={setSelectedStock}
        />
        
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}>
          <Routes>
            <Route path="/" element={<MarketOverview />} />
            <Route 
              path="/analysis" 
              element={<StockAnalysis stock={selectedStock} />} 
            />
            <Route path="/portfolio" element={<PortfolioPerformance />} />
            <Route 
              path="/financials" 
              element={<Financials stock={selectedStock} />} 
            />
            <Route 
              path="/forecast" 
              element={<Forecasting stock={selectedStock} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;