import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateLumpSum,
  calculateFD,
  calculateRD,
  calculatePPF,
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

interface Props {
  type: 'lumpsum' | 'fd' | 'rd' | 'ppf';
}

const CONFIG = {
  lumpsum: {
    title: 'Lumpsum',
    icon: 'fas fa-money-bill-wave',
    color: '#8b5cf6',
    inputLabel: 'Total Investment',
    defaultRate: 12,
    rateLabel: 'Expected Return Rate (p.a)'
  },
  fd: {
    title: 'FD',
    icon: 'fas fa-university',
    color: '#f59e0b',
    inputLabel: 'Total Investment',
    defaultRate: 6.5,
    rateLabel: 'Interest Rate (p.a)'
  },
  rd: {
    title: 'RD',
    icon: 'fas fa-piggy-bank',
    color: '#ec4899',
    inputLabel: 'Monthly Investment',
    defaultRate: 6.5,
    rateLabel: 'Interest Rate (p.a)'
  },
  ppf: {
    title: 'PPF',
    icon: 'fas fa-shield-alt',
    color: '#14b8a6',
    inputLabel: 'Yearly Investment',
    defaultRate: 7.1,
    rateLabel: 'Interest Rate (p.a)'
  }
};

const COLORS = ['#3b82f6', '#10b981'];

const InvestmentCalculator: React.FC<Props> = ({ type }) => {
  const config = CONFIG[type];
  const [currency, setCurrency] = useState<string>(detectCurrencyFromLocale());
  
  const [investment, setInvestment] = useState<number>(type === 'ppf' || type === 'rd' ? 500 : 5000);
  const [rate, setRate] = useState<number>(config.defaultRate);
  const [years, setYears] = useState<number>(type === 'ppf' ? 15 : 5);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    if (type === 'lumpsum') return calculateLumpSum(investment, rate, years);
    if (type === 'fd') return calculateFD(investment, rate, years);
    if (type === 'rd') return calculateRD(investment, rate, years);
    if (type === 'ppf') return calculatePPF(investment, rate, years);
    return calculateLumpSum(investment, rate, years);
  }, [type, investment, rate, years]);

  const chartData = useMemo(() => [
    { name: 'Invested Amount', value: result.investedAmount },
    { name: 'Est. Returns', value: result.estReturns }
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
      title={config.title} 
      titleHighlight="Calculator" 
      icon={config.icon} 
      iconColor={config.color}
      currency={currency}
      onCurrencyChange={setCurrency}
    >
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Investment Details
            </h2>
            
            <SliderInput 
              label={config.inputLabel} 
              value={investment} 
              min={500} 
              max={type === 'ppf' ? 150000 : 10000000} 
              step={500} 
              onChange={setInvestment} 
              prefix={symbol}
            />

            <SliderInput 
              label={config.rateLabel} 
              value={rate} 
              min={1} 
              max={15} 
              step={0.1} 
              onChange={setRate} 
              suffix={<span className="unit-label">%</span>}
            />

            <SliderInput 
              label="Time Period" 
              value={years} 
              min={type === 'ppf' ? 15 : 1} 
              max={40} 
              step={1} 
              onChange={setYears} 
              suffix={<span className="unit-label">Years</span>}
            />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Total Value</div>
                <div className="result-amount" style={{ color: config.color }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Invested Amount</span>
                  <span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Est. Returns</span>
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

export default InvestmentCalculator;