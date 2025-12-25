import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateSimpleInterest,
  calculateGenericCompoundInterest,
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

interface Props {
  type: 'simple' | 'compound';
}

const COLORS = ['#3b82f6', '#10b981'];

const InterestCalculator: React.FC<Props> = ({ type }) => {
  const isCompound = type === 'compound';
  const config = {
    title: isCompound ? 'Compound Interest' : 'Simple Interest',
    icon: isCompound ? 'fas fa-sync-alt' : 'fas fa-percentage',
    color: isCompound ? '#8b5cf6' : '#f59e0b'
  };

  const [currency, setCurrency] = useState<string>(detectCurrencyFromLocale());
  const [principal, setPrincipal] = useState<number>(10000);
  const [rate, setRate] = useState<number>(5);
  const [years, setYears] = useState<number>(5);
  const [frequency, setFrequency] = useState<number>(1); // Default to Annual for Compound

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    if (isCompound) {
      return calculateGenericCompoundInterest(principal, rate, years, frequency);
    } else {
      return calculateSimpleInterest(principal, rate, years);
    }
  }, [type, principal, rate, years, frequency]);

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
              Details
            </h2>
            
            <SliderInput 
              label="Principal Amount" 
              value={principal} 
              min={1000} 
              max={10000000} 
              step={500} 
              onChange={setPrincipal} 
              prefix={symbol}
            />

            <SliderInput 
              label="Interest Rate (p.a)" 
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

            {isCompound && (
               <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
                    Compounding Frequency
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {[
                       { label: 'Yearly', val: 1 },
                       { label: 'Half-Yearly', val: 2 },
                       { label: 'Quarterly', val: 4 },
                       { label: 'Monthly', val: 12 }
                     ].map((item) => (
                       <button
                         key={item.val}
                         onClick={() => setFrequency(item.val)}
                         style={{
                           flex: 1,
                           padding: '12px',
                           borderRadius: '10px',
                           border: frequency === item.val ? `2px solid ${config.color}` : '1px solid #e2e8f0',
                           background: frequency === item.val ? '#f5f3ff' : 'white',
                           color: frequency === item.val ? config.color : '#64748b',
                           fontWeight: 700,
                           cursor: 'pointer',
                           fontSize: '13px'
                         }}
                       >
                         {item.label}
                       </button>
                     ))}
                  </div>
               </div>
            )}
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Total Amount</div>
                <div className="result-amount" style={{ color: config.color }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Principal Amount</span>
                  <span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Interest</span>
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

export default InterestCalculator;