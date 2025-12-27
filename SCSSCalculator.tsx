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
  const [amount, setAmount] = useState<number>(100000);
  const [rate, setRate] = useState<number>(8.2);
  const [extended, setExtended] = useState<boolean>(false);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const result = useMemo(() => calculateSCSS(amount, rate, extended), [amount, rate, extended]);

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
    <Layout title="SCSS" titleHighlight="Calculator" icon="fas fa-user-clock" iconColor="#0ea5e9" currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .formula-box { background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #0ea5e9; font-family: monospace; font-size: 16px; margin: 20px 0; }
          .chart-container { height: 220px; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Details</h2>
            <SliderInput label="Investment" value={amount} min={1000} max={3000000} step={1000} onChange={setAmount} prefix={symbol} />
            <SliderInput label="Interest Rate" value={rate} min={5} max={12} step={0.1} onChange={setRate} suffix="%" />
            <div className="toggle-group" style={{ width: '100%', display: 'flex', marginTop: '24px' }}>
                <button className={`toggle-btn ${!extended ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setExtended(false)}>5 Years</button>
                <button className={`toggle-btn ${extended ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setExtended(true)}>8 Years</button>
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Quarterly Income</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0ea5e9' }}>{formatCurrency(result.quarterlyIncome, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Invested</span><span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Total Interest</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
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
          <h2>Senior Citizen Savings Scheme (SCSS) Explained</h2>
          <p>
            The SCSS is a government-backed savings instrument designed for retirees. It offers a safe environment for your corpus with attractive quarterly payouts, making it a favorite for pension replacement.
          </p>

          <h3>Investment Limits & Tenure</h3>
          <p>You can invest up to ₹30 Lakhs in an SCSS account. The scheme has a standard tenure of 5 years, which can be extended once by an additional 3 years.</p>

          <h3>Quarterly Interest Calculation</h3>
          <p>Unlike regular FDs where interest might compound, SCSS pays out interest every quarter. This interest is taxable as per your slab, but the principal is eligible for Section 80C deductions.</p>
          <div className="formula-box">
            Quarterly Income = (Principal &times; Annual Rate) / 4 / 100
          </div>
        </section>
    </Layout>
  );
};

export default SCSSCalculator;