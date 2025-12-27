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
  const [frequency, setFrequency] = useState<number>(1);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const result = useMemo(() => isCompound ? calculateGenericCompoundInterest(principal, rate, years, frequency) : calculateSimpleInterest(principal, rate, years), [type, principal, rate, years, frequency]);

  const chartData = [{ name: 'Principal', value: result.investedAmount }, { name: 'Interest', value: result.estReturns }];

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const color = index === 0 ? 'white' : 'white';

    return percent > 0.05 ? (
      <text x={x} y={y} fill={color} textAnchor="middle" dominantBaseline="central" style={{ fontSize: '13px', fontWeight: 800 }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Layout title={config.title} titleHighlight="Calculator" icon={config.icon} iconColor={config.color} currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .formula-box { background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid ${config.color}; font-family: monospace; font-size: 16px; margin: 20px 0; }
          .chart-container { height: 220px; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Details</h2>
            <SliderInput label="Principal" value={principal} min={1000} max={10000000} step={500} onChange={setPrincipal} prefix={symbol} />
            <SliderInput label="Rate (%)" value={rate} min={1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Years" value={years} min={1} max={30} step={1} onChange={setYears} suffix="Y" />
            {isCompound && (
               <div style={{ marginTop: '24px' }}>
                  <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px', display: 'block' }}>Compounding</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {[{ label: 'Annual', val: 1 }, { label: 'Half-Yr', val: 2 }, { label: 'Quarter', val: 4 }, { label: 'Monthly', val: 12 }].map((item) => (
                       <button key={item.val} onClick={() => setFrequency(item.val)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: frequency === item.val ? `2px solid ${config.color}` : '1px solid #e2e8f0', background: frequency === item.val ? '#f5f3ff' : 'white', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>{item.label}</button>
                     ))}
                  </div>
               </div>
            )}
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Total Amount</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: config.color }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Principal</span><span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Interest</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
             </div>
             <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" stroke="#f8fafc" strokeWidth={4} label={renderPieLabel} labelLine={false}>
                      {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <section className="seo-section">
          <h2>Simple vs. Compound Interest: What's the Difference?</h2>
          <p>
            The main difference lies in how interest is calculated. <strong>Simple Interest</strong> is based solely on the principal amount, while <strong>Compound Interest</strong> is calculated on the principal PLUS the accumulated interest of previous periods.
          </p>

          <h3>Simple Interest Formula</h3>
          <div className="formula-box">SI = (P &times; R &times; T) / 100</div>
          <p>This is commonly used in short-term personal loans or specific financial instruments.</p>

          <h3>Compound Interest Formula</h3>
          <div className="formula-box">A = P &times; (1 + r/n)^(n&times;t)</div>
          <p>
            Compound interest is the "Eighth Wonder of the World." The frequency of compounding (Monthly vs Annual) can significantly change the final outcome, as interest begins to earn interest more frequently.
          </p>
        </section>
    </Layout>
  );
};

export default InterestCalculator;