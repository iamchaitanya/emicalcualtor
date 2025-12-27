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

  const chartData = [{ name: 'Final Balance', value: result.totalValue }, { name: 'Total Withdrawn', value: result.estReturns }];

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
          .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
          .formula-box { background: #f5f3ff; padding: 24px; border-radius: 12px; border-left: 4px solid #6366f1; font-family: 'Inter', monospace; font-size: 18px; font-weight: 700; margin: 24px 0; color: #5b21b6; text-align: center; }
          .chart-container { height: 220px; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } .formula-box { font-size: 15px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Retirement Withdrawal Plan</h2>
            <SliderInput label="Initial Capital" value={investment} min={10000} max={10000000} step={5000} onChange={setInvestment} prefix={symbol} />
            <SliderInput label="Monthly Withdrawal" value={withdrawal} min={500} max={100000} step={500} onChange={setWithdrawal} prefix={symbol} />
            <SliderInput label="Portfolio Return Rate" value={rate} min={1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Tenure (Years)" value={years} min={1} max={30} step={1} onChange={setYears} suffix="Y" />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Final Corpus Balance</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#6366f1' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Total Amount Withdrawn</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
             </div>
             <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" stroke="#f8fafc" strokeWidth={4} label={renderPieLabel} labelLine={false}>
                      {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <section className="seo-section">
          <h2>Strategic Income with Systematic Withdrawal Plans (SWP)</h2>
          <p>
            A <strong>Systematic Withdrawal Plan (SWP)</strong> is a powerful financial tool that allows you to withdraw a fixed amount of money from your mutual fund investment at regular intervals. It is effectively the "reverse" of an SIP and is widely considered the gold standard for post-retirement income.
          </p>

          <h3>1. How SWP Works</h3>
          <p>When you trigger an SWP, the fund house redeems units of your mutual fund equivalent to the withdrawal amount you've set. The remaining units continue to stay invested and grow based on the fund's performance. If your withdrawal rate is lower than the fund's return rate, your corpus can theoretically last forever.</p>
          
          <h3>The SWP Core Logic</h3>
          <div className="formula-box">
            Ending Balance = (Opening Balance + Returns) - Withdrawal
          </div>

          <h3>2. Tax Efficiency: SWP vs. Dividends</h3>
          <p>Unlike dividends, which are often taxed at your income slab rate, SWP withdrawals are treated as "Redemptions." Only the <strong>Capital Gain</strong> portion of each withdrawal is taxable. This significantly increases your "In-hand" income, especially for those in higher tax brackets.</p>

          <h3>3. Protecting Your Capital</h3>
          <p>The biggest risk in an SWP is "Sequence of Returns" risk. If the market crashes in the early years of your withdrawal, you might deplete your units too quickly. To mitigate this, experts suggest a withdrawal rate of <strong>4-6% per annum</strong>, which allows your corpus to weather market cycles comfortably.</p>

          <h3>4. Ideal for Retirement</h3>
          <p>SWPs eliminate the need to "time the market" for your monthly expenses. They provide the predictability of a pension with the growth potential of equity, making them a cornerstone of any modern retirement strategy.</p>
        </section>
    </Layout>
  );
};

export default SWPCalculator;