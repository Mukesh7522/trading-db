// src/pages/Financials.jsx - 4 QUARTERS WITH EXACT NUMBERS
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FileText, DollarSign, TrendingUp, Wallet, Calendar, AlertCircle } from 'lucide-react';
import { stockAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Financials = ({ stock = 'AAPL' }) => {
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState(null);
  const [selectedStatement, setSelectedStatement] = useState('income');

  useEffect(() => {
    loadFinancials();
  }, [stock]);

  const loadFinancials = async () => {
    try {
      setLoading(true);
      const data = await stockAPI.getFinancials(stock);
      console.log('📊 Raw Financial Data:', {
        income: data?.income?.length || 0,
        balance: data?.balance?.length || 0,
        cashflow: data?.cashflow?.length || 0,
        firstIncome: data?.income?.[0],
        allIncomeDates: data?.income?.map(q => q.fiscal_date)
      });
      setFinancials(data);
    } catch (err) {
      console.error('❌ Error loading financials:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const income = financials?.income || [];
  const balance = financials?.balance || [];
  const cashflow = financials?.cashflow || [];

  // Get date range for display
  const getDateRange = (data) => {
    if (!data || data.length === 0) return 'No data available';
    const dates = data.map(q => new Date(q.fiscal_date)).sort((a, b) => a - b);
    const oldest = dates[0];
    const newest = dates[dates.length - 1];
    return `${oldest.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${newest.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  // Take EXACTLY 4 quarters and reverse for chronological order
  const last4Income = income.slice(0, 4).reverse();
  const last4Balance = balance.slice(0, 4).reverse();
  const last4Cashflow = cashflow.slice(0, 4).reverse();

  // Prepare chart data
  const revenueData = last4Income.map(q => ({
    date: new Date(q.fiscal_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: parseInt(q.total_revenue || 0) / 1e9,
    gross_profit: parseInt(q.gross_profit || 0) / 1e9,
    net_income: parseInt(q.net_income || 0) / 1e9,
    operating_income: parseInt(q.operating_income || 0) / 1e9
  }));

  const marginData = last4Income.map(q => ({
    date: new Date(q.fiscal_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    gross_margin: parseFloat(q.gross_margin || 0) * 100,
    operating_margin: parseFloat(q.operating_margin || 0) * 100,
    net_margin: parseFloat(q.net_margin || 0) * 100
  }));

  const balanceData = last4Balance.map(q => ({
    date: new Date(q.fiscal_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    assets: parseInt(q.total_assets || 0) / 1e9,
    liabilities: parseInt(q.total_liabilities || 0) / 1e9,
    equity: parseInt(q.total_equity || 0) / 1e9,
    cash: parseInt(q.cash_and_equivalents || 0) / 1e9
  }));

  const cashflowData = last4Cashflow.map(q => ({
    date: new Date(q.fiscal_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    operating: parseInt(q.operating_cashflow || 0) / 1e9,
    investing: parseInt(q.investing_cashflow || 0) / 1e9,
    financing: parseInt(q.financing_cashflow || 0) / 1e9,
    free_cashflow: parseInt(q.free_cashflow || 0) / 1e9
  }));

  // Latest quarter metrics
  const latestIncome = income[0] || {};
  const latestBalance = balance[0] || {};
  const latestCashflow = cashflow[0] || {};

  // Format exact numbers with commas (no rounding)
  const formatExactNumber = (value) => {
    if (!value && value !== 0) return '$0';
    const num = parseInt(value);
    return '$' + num.toLocaleString('en-US');
  };

  const statements = [
    { id: 'income', label: 'Income Statement', icon: DollarSign },
    { id: 'balance', label: 'Balance Sheet', icon: Wallet },
    { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Financial Statements
          </h1>
          <p className="text-gray-400 mt-1">{stock} - Quarterly Data</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-semibold">Last 4 Quarters</span>
          </div>
          <p className="text-xs text-gray-500">{getDateRange(income)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Available: Income ({income.length}), Balance ({balance.length}), Cash Flow ({cashflow.length})
          </p>
        </div>
      </motion.div>

      {/* Data availability warning */}
      {(income.length < 4 || balance.length < 4 || cashflow.length < 4) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-500 mb-1">Limited Financial Data</p>
            <p className="text-sm text-gray-400">
              {stock} has fewer than 4 quarters of data available. 
              Showing {Math.min(income.length, balance.length, cashflow.length)} available quarters.
              This may occur for newer companies or those with limited reporting history.
            </p>
          </div>
        </motion.div>
      )}

      {/* Statement Selector */}
      <div className="flex gap-2 flex-wrap">
        {statements.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStatement(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedStatement === s.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-dark-elevated hover:bg-dark-border text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Income Statement */}
      {selectedStatement === 'income' && (
        <>
          {/* Key Metrics Cards - EXACT NUMBERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Revenue"
              value={formatExactNumber(latestIncome.total_revenue)}
              icon={<DollarSign className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Gross Profit"
              value={formatExactNumber(latestIncome.gross_profit)}
              subtitle={`${(parseFloat(latestIncome.gross_margin || 0) * 100).toFixed(2)}% margin`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="Operating Income"
              value={formatExactNumber(latestIncome.operating_income)}
              subtitle={`${(parseFloat(latestIncome.operating_margin || 0) * 100).toFixed(2)}% margin`}
              icon={<FileText className="w-5 h-5" />}
              color="purple"
            />
            <MetricCard
              label="Net Income"
              value={formatExactNumber(latestIncome.net_income)}
              subtitle={`${(parseFloat(latestIncome.net_margin || 0) * 100).toFixed(2)}% margin`}
              icon={<Wallet className="w-5 h-5" />}
              color="pink"
            />
          </div>

          {/* Revenue Trend */}
          {revenueData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border"
            >
              <h2 className="text-xl font-semibold mb-4">
                Revenue & Profitability Trend ({revenueData.length} Quarters)
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    </linearGradient>
                    <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.5}/>
                    </linearGradient>
                    <linearGradient id="operatingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    </linearGradient>
                    <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'Billions ($)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    formatter={(value) => `$${value.toFixed(2)}B`}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar dataKey="revenue" fill="url(#revenueGradient)" name="Revenue" radius={[4, 4, 0, 0]} animationDuration={400} />
                  <Bar dataKey="gross_profit" fill="url(#grossGradient)" name="Gross Profit" radius={[4, 4, 0, 0]} animationDuration={500} />
                  <Bar dataKey="operating_income" fill="url(#operatingGradient)" name="Operating Income" radius={[4, 4, 0, 0]} animationDuration={600} />
                  <Bar dataKey="net_income" fill="url(#netGradient)" name="Net Income" radius={[4, 4, 0, 0]} animationDuration={700} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="bg-dark-surface rounded-xl p-6 border border-dark-border text-center text-gray-400">
              No revenue data available for chart
            </div>
          )}

          {/* Profit Margins */}
          {marginData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border"
            >
              <h2 className="text-xl font-semibold mb-4">Profit Margins Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'Margin (%)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    formatter={(value) => `${value.toFixed(2)}%`}
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gross_margin" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    name="Gross Margin"
                    dot={false}
                    activeDot={{ r: 6, fill: '#10b981' }}
                    animationDuration={400}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="operating_margin" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    name="Operating Margin"
                    dot={false}
                    activeDot={{ r: 6, fill: '#8b5cf6' }}
                    animationDuration={500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net_margin" 
                    stroke="#ec4899" 
                    strokeWidth={3} 
                    name="Net Margin"
                    dot={false}
                    activeDot={{ r: 6, fill: '#ec4899' }}
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Income Statement Table */}
          {last4Income.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border overflow-x-auto"
            >
              <h2 className="text-xl font-semibold mb-4">
                Quarterly Income Statement ({last4Income.length} Quarters)
              </h2>
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                    <th className="text-right py-3 px-4">Cost of Revenue</th>
                    <th className="text-right py-3 px-4">Gross Profit</th>
                    <th className="text-right py-3 px-4">Operating Exp</th>
                    <th className="text-right py-3 px-4">Operating Income</th>
                    <th className="text-right py-3 px-4">Net Income</th>
                  </tr>
                </thead>
                <tbody>
                  {last4Income.map((q, idx) => (
                    <tr key={idx} className="border-b border-dark-border/50 hover:bg-dark-elevated transition-colors">
                      <td className="py-3 px-4 font-semibold">
                        {new Date(q.fiscal_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right">${(parseInt(q.total_revenue || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-red-400">${(parseInt(q.cost_of_revenue || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-green-400">${(parseInt(q.gross_profit || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-red-400">${(parseInt(q.operating_expenses || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-purple-400">${(parseInt(q.operating_income || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-blue-400 font-semibold">${(parseInt(q.net_income || 0) / 1e9).toFixed(2)}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="bg-dark-surface rounded-xl p-6 border border-dark-border text-center text-gray-400">
              No income statement data available
            </div>
          )}
        </>
      )}

      {/* Balance Sheet */}
      {selectedStatement === 'balance' && (
        <>
          {/* Key Metrics Cards - EXACT NUMBERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Assets"
              value={formatExactNumber(latestBalance.total_assets)}
              icon={<DollarSign className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Total Liabilities"
              value={formatExactNumber(latestBalance.total_liabilities)}
              icon={<FileText className="w-5 h-5" />}
              color="red"
            />
            <MetricCard
              label="Total Equity"
              value={formatExactNumber(latestBalance.total_equity)}
              icon={<Wallet className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="Cash & Equivalents"
              value={formatExactNumber(latestBalance.cash_and_equivalents)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
            />
          </div>

          {/* Balance Sheet Trend */}
          {balanceData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border"
            >
              <h2 className="text-xl font-semibold mb-4">
                Assets, Liabilities & Equity Trend ({balanceData.length} Quarters)
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={balanceData}>
                  <defs>
                    <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="liabilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'Billions ($)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    formatter={(value) => `$${value.toFixed(2)}B`}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="assets" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#assetsGradient)" 
                    name="Assets"
                    animationDuration={400}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="liabilities" 
                    stackId="2" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fill="url(#liabilitiesGradient)" 
                    name="Liabilities"
                    animationDuration={500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stackId="2" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#equityGradient)" 
                    name="Equity"
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Balance Sheet Table */}
          {last4Balance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border overflow-x-auto"
            >
              <h2 className="text-xl font-semibold mb-4">
                Quarterly Balance Sheet ({last4Balance.length} Quarters)
              </h2>
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-right py-3 px-4">Total Assets</th>
                    <th className="text-right py-3 px-4">Total Liabilities</th>
                    <th className="text-right py-3 px-4">Total Equity</th>
                    <th className="text-right py-3 px-4">Cash & Equiv.</th>
                    <th className="text-right py-3 px-4">Current Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {last4Balance.map((q, idx) => (
                    <tr key={idx} className="border-b border-dark-border/50 hover:bg-dark-elevated transition-colors">
                      <td className="py-3 px-4 font-semibold">
                        {new Date(q.fiscal_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right">${(parseInt(q.total_assets || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-red-400">${(parseInt(q.total_liabilities || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-green-400">${(parseInt(q.total_equity || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-blue-400">${(parseInt(q.cash_and_equivalents || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-purple-400">{parseFloat(q.current_ratio || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Financial Ratios */}
          {latestBalance.current_ratio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border"
            >
              <h2 className="text-xl font-semibold mb-4">Key Financial Ratios (Latest Quarter)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RatioCard
                  label="Current Ratio"
                  value={parseFloat(latestBalance.current_ratio || 0).toFixed(2)}
                  description="Ability to pay short-term obligations"
                  benchmark="Good: > 1.5"
                />
                <RatioCard
                  label="Debt to Equity"
                  value={parseFloat(latestBalance.debt_to_equity || 0).toFixed(2)}
                  description="Financial leverage"
                  benchmark="Good: < 2.0"
                />
                <RatioCard
                  label="Debt to Assets"
                  value={(parseFloat(latestBalance.debt_to_assets || 0) * 100).toFixed(1) + '%'}
                  description="Proportion of debt financing"
                  benchmark="Good: < 40%"
                />
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Cash Flow */}
      {selectedStatement === 'cashflow' && (
        <>
          {/* Key Metrics Cards - EXACT NUMBERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Operating Cash Flow"
              value={formatExactNumber(latestCashflow.operating_cashflow)}
              icon={<DollarSign className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="Investing Cash Flow"
              value={formatExactNumber(latestCashflow.investing_cashflow)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Financing Cash Flow"
              value={formatExactNumber(latestCashflow.financing_cashflow)}
              icon={<Wallet className="w-5 h-5" />}
              color="purple"
            />
            <MetricCard
              label="Free Cash Flow"
              value={formatExactNumber(latestCashflow.free_cashflow)}
              icon={<FileText className="w-5 h-5" />}
              color="gold"
            />
          </div>

          {/* Cash Flow Trend */}
          {cashflowData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border"
            >
              <h2 className="text-xl font-semibold mb-4">
                Cash Flow Trend ({cashflowData.length} Quarters)
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cashflowData}>
                  <defs>
                    <linearGradient id="operatingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.5}/>
                    </linearGradient>
                    <linearGradient id="investingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    </linearGradient>
                    <linearGradient id="financingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    </linearGradient>
                    <linearGradient id="freeCashflowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'Billions ($)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}
                    formatter={(value) => `$${value.toFixed(2)}B`}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="operating" 
                    fill="url(#operatingGradient)" 
                    name="Operating"
                    radius={[4, 4, 0, 0]}
                    animationDuration={400}
                  />
                  <Bar 
                    dataKey="investing" 
                    fill="url(#investingGradient)" 
                    name="Investing"
                    radius={[4, 4, 0, 0]}
                    animationDuration={500}
                  />
                  <Bar 
                    dataKey="financing" 
                    fill="url(#financingGradient)" 
                    name="Financing"
                    radius={[4, 4, 0, 0]}
                    animationDuration={600}
                  />
                  <Bar 
                    dataKey="free_cashflow" 
                    fill="url(#freeCashflowGradient)" 
                    name="Free Cash Flow"
                    radius={[4, 4, 0, 0]}
                    animationDuration={700}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Cash Flow Table */}
          {last4Cashflow.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-surface rounded-xl p-6 border border-dark-border overflow-x-auto"
            >
              <h2 className="text-xl font-semibold mb-4">
                Quarterly Cash Flow Statement ({last4Cashflow.length} Quarters)
              </h2>
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left py-3 px-4">Period</th>
                    <th className="text-right py-3 px-4">Operating CF</th>
                    <th className="text-right py-3 px-4">Investing CF</th>
                    <th className="text-right py-3 px-4">Financing CF</th>
                    <th className="text-right py-3 px-4">Free Cash Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {last4Cashflow.map((q, idx) => (
                    <tr key={idx} className="border-b border-dark-border/50 hover:bg-dark-elevated transition-colors">
                      <td className="py-3 px-4 font-semibold">
                        {new Date(q.fiscal_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right text-green-400">${(parseInt(q.operating_cashflow || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-blue-400">${(parseInt(q.investing_cashflow || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-purple-400">${(parseInt(q.financing_cashflow || 0) / 1e9).toFixed(2)}B</td>
                      <td className="py-3 px-4 text-right text-yellow-400 font-semibold">${(parseInt(q.free_cashflow || 0) / 1e9).toFixed(2)}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, subtitle, icon, color }) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
    gold: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-6 hover:scale-105 transition-transform`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-lg font-bold break-words">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-${color}-500 ml-2 shrink-0`}>{icon}</div>
      </div>
    </motion.div>
  );
};

const RatioCard = ({ label, value, description, benchmark }) => (
  <div className="bg-dark-elevated rounded-lg p-4 border border-dark-border">
    <p className="text-lg font-semibold mb-1">{label}</p>
    <p className="text-3xl font-bold text-blue-400 mb-2">{value}</p>
    <p className="text-sm text-gray-400 mb-1">{description}</p>
    <p className="text-xs text-gray-500">{benchmark}</p>
  </div>
);

export default Financials;