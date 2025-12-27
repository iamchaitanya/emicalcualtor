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
  const result = useMemo(() => calculateSWP(investment, withdrawal, rate, years), [investment, withdrawal, rate, years]);

  const chartData = [{ name: 'Remaining Balance', value: result.totalValue }, { name: 'Total Withdrawn', value: result.estReturns }];

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
    <Layout title="SWP" titleHighlight="Calculator" icon="fas fa-hand-holding-usd" iconColor="#6366f1" currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .formula-box { background: #f5f3ff; padding: 20px; border-radius: 12px; border-left: 4px solid #6366f1; font-family: monospace; font-size: 16px; margin: 20px 0; }
          .chart-container { height: 220px; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Withdrawal Plan</h2>
            <SliderInput label="Total Investment" value={investment} min={10000} max={10000000} step={5000} onChange={setInvestment} prefix={symbol} />
            <SliderInput label="Monthly Withdrawal" value={withdrawal} min={500} max={100000} step={500} onChange={setWithdrawal} prefix={symbol} />
            <SliderInput label="Return Rate" value={rate} min={1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Years" value={years} min={1} max={30} step={1} onChange={setYears} suffix="Y" />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Final Balance</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#6366f1' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Total Withdrawn</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
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
          <h2>Systematic Withdrawal Plan (SWP) for Retirement Income</h2>
          <p>
            An <strong>SWP</strong> is the opposite of an SIP. While SIPs help you build a corpus, SWPs allow you to withdraw a fixed amount of money from your investment periodically (usually monthly) to act as a regular income stream.
          </p>

          <h3>The Math Behind SWP</h3>
          <p>As you withdraw funds, the remaining balance continues to earn interest. If your withdrawal rate is lower than your return rate, your corpus could technically last forever.</p>
          <div className="formula-box">
            New Balance = (Current Balance + Interest Earned) - Withdrawal Amount
          </div>

          <h3>Benefits of SWP over Dividend Payouts:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Tax Efficiency:</strong> SWP withdrawals are treated as redemptions, so only the "capital gain" portion is taxed.</li>
            <li><strong>Predictability:</strong> You decide the exact amount you need every month.</li>
          </ul>
        </section>
    </Layout>
  );
};

export default SWPCalculator;