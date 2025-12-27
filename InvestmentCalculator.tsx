import React, { useState, useMemo } from 'react';
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
    inputLabel: 'One-time Investment',
    defaultRate: 12,
    rateLabel: 'Expected Return Rate (p.a)',
    description: 'project the growth of a single investment over time using the power of compounding.'
  },
  fd: {
    title: 'Fixed Deposit (FD)',
    icon: 'fas fa-university',
    color: '#f59e0b',
    inputLabel: 'Deposit Amount',
    defaultRate: 6.5,
    rateLabel: 'Bank Interest Rate (p.a)',
    description: 'Fixed Deposits are high-safety debt instruments offering guaranteed returns with periodic compounding.'
  },
  rd: {
    title: 'Recurring Deposit (RD)',
    icon: 'fas fa-piggy-bank',
    color: '#ec4899',
    inputLabel: 'Monthly Deposit',
    defaultRate: 6.5,
    rateLabel: 'Bank Interest Rate (p.a)',
    description: 'Recurring Deposits are ideal for building a savings habit by depositing a fixed sum every month.'
  },
  ppf: {
    title: 'Public Provident Fund (PPF)',
    icon: 'fas fa-shield-alt',
    color: '#14b8a6',
    inputLabel: 'Yearly Contribution',
    defaultRate: 7.1,
    rateLabel: 'Current Interest Rate (p.a)',
    description: 'PPF is a long-term, government-backed savings scheme with EEE (Exempt-Exempt-Exempt) tax status.'
  }
};

const COLORS = ['#3b82f6', '#10b981'];

const InvestmentCalculator: React.FC<Props> = ({ type }) => {
  const config = CONFIG[type];
  const [currency, setCurrency] = useState<string>(detectCurrencyFromLocale());
  const [investment, setInvestment] = useState<number>(type === 'ppf' ? 150000 : (type === 'rd' ? 5000 : 100000));
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

  const chartData = [{ name: 'Invested', value: result.investedAmount }, { name: 'Returns', value: Math.max(0, result.estReturns) }];

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
          .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
          .formula-box { background: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid ${config.color}; font-family: 'Inter', monospace; font-size: 18px; font-weight: 700; margin: 24px 0; color: #1e293b; text-align: center; }
          .chart-container { height: 220px; width: 100%; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } .formula-box { font-size: 15px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>{config.title} Parameters</h2>
            <SliderInput label={config.inputLabel} value={investment} min={500} max={type === 'ppf' ? 150000 : 10000000} step={500} onChange={setInvestment} prefix={symbol} />
            <SliderInput label={config.rateLabel} value={rate} min={1} max={20} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Tenure (Years)" value={years} min={1} max={type === 'ppf' ? 15 : 40} step={1} onChange={setYears} suffix="Years" />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Maturity Value</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: config.color }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Total Invested</span><span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Estimated Returns</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
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
          <h2>Professional Guide to {config.title} Investments</h2>
          <p>{config.description}</p>
          
          {type === 'fd' && (
            <>
              <h3>The Fixed Deposit (FD) Advantage</h3>
              <p>FDs are a cornerstone of conservative financial planning. They offer absolute capital protection and a guaranteed return rate that remains fixed regardless of market fluctuations.</p>
              <h3>How FD Interest is Calculated</h3>
              <p>Most banks use quarterly compounding for FDs. The formula is:</p>
              <div className="formula-box">A = P &times; (1 + r/n)^(n&times;t)</div>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>A:</strong> Final Maturity Amount</li>
                <li><strong>P:</strong> Principal Deposit Amount</li>
                <li><strong>r:</strong> Annual interest rate (e.g., 0.065 for 6.5%)</li>
                <li><strong>n:</strong> Compounding frequency (4 for quarterly)</li>
                <li><strong>t:</strong> Time duration in years</li>
              </ul>
            </>
          )}

          {type === 'ppf' && (
            <>
              <h3>The Power of Public Provident Fund (PPF)</h3>
              <p>PPF is arguably the best debt investment for long-term goals like retirement. It carries the "EEE" tax status:</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>Exempt:</strong> Contributions are tax-deductible under Section 80C.</li>
                <li><strong>Exempt:</strong> Interest earned is completely tax-free.</li>
                <li><strong>Exempt:</strong> Maturity amount is tax-free.</li>
              </ul>
              <h3>PPF Investment Strategy</h3>
              <p>To maximize interest, always invest before the 5th of the month. Interest is calculated on the minimum balance between the 5th and the last day of every month.</p>
              <div className="formula-box">F = P &times; [((1 + r)^n - 1) / r]</div>
            </>
          )}

          {type === 'rd' && (
            <>
              <h3>Building Habits with Recurring Deposits (RD)</h3>
              <p>RDs allow you to build a significant corpus by setting aside small amounts every month. This is perfect for short-term goals like an annual vacation or purchasing a gadget.</p>
              <h3>RD vs. SIP</h3>
              <p>While an RD gives guaranteed returns with no risk, an SIP in a mutual fund might offer higher returns but comes with market volatility. Conservative investors prefer RDs for their predictability.</p>
            </>
          )}

          {type === 'lumpsum' && (
            <>
              <h3>Mastering Lumpsum Investment Growth</h3>
              <p>When you invest a large sum at once, every dollar starts working for you immediately. This "Time in the Market" is the biggest driver of long-term wealth.</p>
              <h3>The Rule of 72</h3>
              <p>A quick mental math trick: Divide 72 by your annual interest rate to see how many years it will take to double your money. At 12% returns, your lumpsum doubles every 6 years!</p>
              <div className="formula-box">FV = PV &times; (1 + r)^n</div>
            </>
          )}
        </section>
    </Layout>
  );
};

export default InvestmentCalculator;