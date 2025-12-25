import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateSWP,
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const COLORS = ['#3b82f6', '#10b981'];

const SWPCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<string>(detectCurrencyFromLocale());
  const [investment, setInvestment] = useState<number>(1000000);
  const [withdrawal, setWithdrawal] = useState<number>(10000);
  const [rate, setRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    return calculateSWP(investment, withdrawal, rate, years);
  }, [investment, withdrawal, rate, years]);

  const chartData = useMemo(() => [
    { name: 'Remaining Value', value: result.totalValue },
    { name: 'Total Withdrawn', value: result.estReturns } // estReturns reused as withdrawn amount here based on utils
  ], [result]);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 800, pointerEvents: 'none', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Layout 
      title="SWP" 
      titleHighlight="Calculator" 
      icon="fas fa-hand-holding-usd" 
      iconColor="#6366f1"
      currency={currency}
      onCurrencyChange={setCurrency}
    >
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Withdrawal Plan
            </h2>
            
            <SliderInput 
              label="Total Investment" 
              value={investment} 
              min={10000} 
              max={10000000} 
              step={5000} 
              onChange={setInvestment} 
              prefix={symbol}
            />

            <SliderInput 
              label="Withdrawal Per Month" 
              value={withdrawal} 
              min={500} 
              max={100000} 
              step={500} 
              onChange={setWithdrawal} 
              prefix={symbol}
            />

            <SliderInput 
              label="Expected Return Rate (p.a)" 
              value={rate} 
              min={1} 
              max={30} 
              step={0.1} 
              onChange={setRate} 
              suffix={<span className="unit-label">%</span>}
            />

            <SliderInput 
              label="Time Period" 
              value={years} 
              min={1} 
              max={30} 
              step={1} 
              onChange={setYears} 
              suffix={<span className="unit-label">Years</span>}
            />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Final Balance</div>
                <div className="result-amount" style={{ color: '#6366f1' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Investment</span>
                  <span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Withdrawn</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span>
                </div>
             </div>

             <div style={{ width: '100%', height: '220px', marginTop: '24px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      dataKey="value" 
                      stroke="#f8fafc"
                      strokeWidth={4}
                      label={renderLabel}
                      labelLine={false}
                    >
                      {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
    </Layout>
  );
};

export default SWPCalculator;