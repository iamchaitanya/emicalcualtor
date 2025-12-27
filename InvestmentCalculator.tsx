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
    inputLabel: 'Total Investment',
    defaultRate: 12,
    rateLabel: 'Expected Return Rate (p.a)',
    description: 'Calculate the growth of a one-time investment over time using compound interest.'
  },
  fd: {
    title: 'FD',
    icon: 'fas fa-university',
    color: '#f59e0b',
    inputLabel: 'Total Investment',
    defaultRate: 6.5,
    rateLabel: 'Interest Rate (p.a)',
    description: 'Fixed Deposits offer guaranteed returns with quarterly compounding interest.'
  },
  rd: {
    title: 'RD',
    icon: 'fas fa-piggy-bank',
    color: '#ec4899',
    inputLabel: 'Monthly Investment',
    defaultRate: 6.5,
    rateLabel: 'Interest Rate (p.a)',
    description: 'Recurring Deposits help you save a fixed amount every month while earning interest.'
  },
  ppf: {
    title: 'PPF',
    icon: 'fas fa-shield-alt',
    color: '#14b8a6',
    inputLabel: 'Yearly Investment',
    defaultRate: 7.1,
    rateLabel: 'Interest Rate (p.a)',
    description: 'Public Provident Fund is a long-term, tax-free savings scheme backed by the government.'
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

  const chartData = [{ name: 'Invested', value: result.investedAmount }, { name: 'Returns', value: result.estReturns }];

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
          .chart-container { height: 220px; width: 100%; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Details</h2>
            <SliderInput label={config.inputLabel} value={investment} min={500} max={10000000} step={500} onChange={setInvestment} prefix={symbol} />
            <SliderInput label={config.rateLabel} value={rate} min={1} max={20} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Time Period" value={years} min={1} max={40} step={1} onChange={setYears} suffix="Years" />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Total Value</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: config.color }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Invested</span><span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Est. Returns</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
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
          <h2>Understanding {config.title} Investments</h2>
          <p>{config.description}</p>
          
          {type === 'fd' && (
            <>
              <h3>Fixed Deposit (FD) Interest Formula</h3>
              <p>Most banks calculate FD interest using quarterly compounding:</p>
              <div className="formula-box">A = P &times; (1 + r/n)^(n&times;t)</div>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>A:</strong> Final Amount</li>
                <li><strong>P:</strong> Principal Amount</li>
                <li><strong>r:</strong> Annual interest rate (decimal)</li>
                <li><strong>n:</strong> Compounding frequency (4 for quarterly)</li>
                <li><strong>t:</strong> Time in years</li>
              </ul>
            </>
          )}

          {type === 'ppf' && (
            <>
              <h3>Public Provident Fund (PPF) Benefits</h3>
              <p>PPF is a EEE (Exempt-Exempt-Exempt) category investment, meaning the contribution, interest, and maturity are all tax-free.</p>
              <h3>PPF Formula</h3>
              <div className="formula-box">F = P &times; [((1 + r)^n - 1) / r]</div>
              <p>The interest is calculated on the minimum balance between the 5th and the last day of every month.</p>
            </>
          )}

          {type === 'lumpsum' && (
            <>
              <h3>Power of Compounding in Lumpsum</h3>
              <p>Lumpsum investments benefit from "Time in the Market." The longer you stay invested, the more your wealth grows exponentially.</p>
              <div className="formula-box">FV = PV &times; (1 + r)^n</div>
            </>
          )}
        </section>
    </Layout>
  );
};

export default InvestmentCalculator;