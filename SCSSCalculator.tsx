import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateSCSS,
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const COLORS = ['#3b82f6', '#10b981'];

const SCSSCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<string>(detectCurrencyFromLocale());
  
  // State
  const [amount, setAmount] = useState<number>(100000);
  const [rate, setRate] = useState<number>(8.2);
  const [extended, setExtended] = useState<boolean>(false);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    return calculateSCSS(amount, rate, extended);
  }, [amount, rate, extended]);

  const chartData = useMemo(() => [
    { name: 'Principal Amount', value: result.investedAmount },
    { name: 'Total Interest', value: result.estReturns }
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
      title="SCSS" 
      titleHighlight="Calculator" 
      icon="fas fa-user-clock" 
      iconColor="#0ea5e9"
      currency={currency}
      onCurrencyChange={setCurrency}
    >
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Scheme Details
            </h2>
            
            <SliderInput 
              label="Investment Amount" 
              value={amount} 
              min={1000} 
              max={3000000} 
              step={1000} 
              onChange={setAmount} 
              prefix={symbol}
            />

            <SliderInput 
              label="Interest Rate (p.a)" 
              value={rate} 
              min={5} 
              max={12} 
              step={0.1} 
              onChange={setRate} 
              suffix={<span className="unit-label">%</span>}
            />

            <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
                   Duration
                </label>
                <div className="toggle-group" style={{ width: '100%', display: 'flex' }}>
                    <button 
                        className={`toggle-btn ${!extended ? 'active' : ''}`} 
                        onClick={() => setExtended(false)}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        5 Years (Standard)
                    </button>
                    <button 
                        className={`toggle-btn ${extended ? 'active' : ''}`} 
                        onClick={() => setExtended(true)}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        8 Years (Extended)
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '32px', background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0369a1', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-info-circle"></i> Senior Citizen Savings Scheme
              </h3>
              <p style={{ fontSize: '13px', color: '#0c4a6e', margin: 0, lineHeight: '1.5' }}>
                SCSS offers quarterly interest payouts. It matures in 5 years, extendable by 3 years. The maximum investment limit is ₹30 Lakhs.
              </p>
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Quarterly Income</div>
                <div className="result-amount" style={{ color: '#0ea5e9' }}>{formatCurrency(result.quarterlyIncome, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Investment</span>
                  <span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Interest</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Value (Principal + Interest)</span>
                  <span className="stat-value">{formatCurrency(result.totalValue, currency)}</span>
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

export default SCSSCalculator;