import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateSIP,
  calculateLumpSum,
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const COLORS = ['#3b82f6', '#10b981'];

const MutualFundCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<string>(detectCurrencyFromLocale());
  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip');
  const [amount, setAmount] = useState<number>(5000);
  const [rate, setRate] = useState<number>(12);
  const [years, setYears] = useState<number>(5);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [stepUpRate, setStepUpRate] = useState<number>(0);
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    let rawResult = mode === 'sip' ? calculateSIP(amount, rate, years, stepUpRate) : calculateLumpSum(amount, rate, years);
    if (adjustInflation) {
      const inflationFactor = Math.pow(1 + inflationRate / 100, years);
      const realTotalValue = rawResult.totalValue / inflationFactor;
      return { investedAmount: rawResult.investedAmount, estReturns: realTotalValue - rawResult.investedAmount, totalValue: realTotalValue, isInflationAdjusted: true };
    }
    return { ...rawResult, isInflationAdjusted: false };
  }, [mode, amount, rate, years, stepUpRate, adjustInflation, inflationRate]);

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
    <Layout title="Mutual Fund" titleHighlight="Returns" icon="fas fa-chart-pie" iconColor="#8b5cf6" currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
          .formula-box { background: #f5f3ff; padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6; font-family: 'Inter', monospace; font-size: 18px; font-weight: 700; margin: 24px 0; color: #7c3aed; text-align: center; }
          .chart-container { height: 220px; width: 100%; min-height: 220px; }
          
          .advanced-toggle-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f5f3ff;
            color: #7c3aed;
            border: 1px dashed #8b5cf6;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 24px;
            width: 100%;
            justify-content: center;
          }
          .advanced-panel {
            margin-top: 20px;
            padding: 24px;
            background: #f8fafc;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
          }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } .formula-box { font-size: 15px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Details</h2>
            <div className="toggle-group" style={{ width: '100%', display: 'flex', marginBottom: '32px' }}>
                <button className={`toggle-btn ${mode === 'sip' ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setMode('sip')}>SIP (Monthly)</button>
                <button className={`toggle-btn ${mode === 'lumpsum' ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setMode('lumpsum')}>Lumpsum (One-time)</button>
            </div>
            <SliderInput label={mode === 'sip' ? "Monthly Investment" : "Total Investment"} value={amount} min={500} max={1000000} step={500} onChange={setAmount} prefix={symbol} />
            <SliderInput label="Returns Rate (Expected)" value={rate} min={1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Years" value={years} min={1} max={40} step={1} onChange={setYears} suffix="Y" />

            <button className="advanced-toggle-btn" onClick={() => setShowAdvanced(!showAdvanced)}>
              <i className={`fas fa-${showAdvanced ? 'minus-circle' : 'plus-circle'}`}></i>
              {showAdvanced ? 'Hide Advanced Options' : 'Personalize Growth Factors'}
            </button>

            {showAdvanced && (
              <div className="advanced-panel">
                <div style={{ marginBottom: '24px' }}>
                  <SliderInput label="Annual Step-Up (%)" value={stepUpRate} min={0} max={50} step={1} onChange={setStepUpRate} suffix="%" />
                </div>
                <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>Adjust for Inflation</span>
                    <button onClick={() => setAdjustInflation(!adjustInflation)} style={{ background: adjustInflation ? '#8b5cf6' : '#e2e8f0', border: 'none', width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '3px', left: adjustInflation ? '23px' : '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'all 0.2s' }} />
                    </button>
                  </div>
                  {adjustInflation && (
                    <SliderInput label="Inflation Rate (%)" value={inflationRate} min={1} max={15} step={0.5} onChange={setInflationRate} suffix="%" />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">{result.isInflationAdjusted ? 'Real Value (Adjusted)' : 'Estimated Wealth'}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Principal Amount</span><span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Wealth Gained</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
             </div>
             <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={75} dataKey="value" stroke="#f8fafc" strokeWidth={4} label={renderPieLabel} labelLine={false}>
                      {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <section className="seo-section">
          <h2>Ultimate Guide to Mutual Fund Returns & Wealth Creation</h2>
          <p>
            Mutual Funds are professionally managed investment vehicles that pool money from many investors to purchase securities. Whether you choose a <strong>SIP (Systematic Investment Plan)</strong> or a <strong>Lumpsum investment</strong>, understanding the underlying growth mechanics is key to achieving your financial goals.
          </p>

          <h3>1. SIP vs. Lumpsum: Which is better?</h3>
          <p><strong>SIP</strong> is ideal for salaried individuals as it encourages disciplined savings and benefits from <em>Rupee Cost Averaging</em>. You buy more units when the market is low and fewer when it is high. <strong>Lumpsum</strong> is better when you have a large windfall (like a bonus) and the markets are undervalued, as it gives you higher exposure to growth over a longer "Time in Market."</p>

          <h3>2. Understanding Net Asset Value (NAV)</h3>
          <p>The price of a single unit of a mutual fund is called its <strong>NAV</strong>. As the value of the stocks/bonds in the fund's portfolio increases, the NAV increases, leading to capital gains for you.</p>

          <h3>3. The Impact of Expense Ratio</h3>
          <p>Every mutual fund charges an annual fee called the <strong>Expense Ratio</strong> to manage your money. Even a small difference of 0.5% can lead to a significant difference in your final corpus over 20 years. Always check for "Direct" plans which have lower expense ratios compared to "Regular" plans.</p>

          <h3>The Compound Interest Formula</h3>
          <p>For Lumpsum investments, we use the standard compound interest formula to project your future wealth:</p>
          <div className="formula-box">
            FV = P &times; (1 + r)^n
          </div>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>FV:</strong> Future Value of Investment</li>
            <li><strong>P:</strong> Principal (Lumpsum) Investment</li>
            <li><strong>r:</strong> Expected Annual Rate of Return</li>
            <li><strong>n:</strong> Number of Years invested</li>
          </ul>

          <h3>4. Why Inflation Matters</h3>
          <p>If your mutual fund returns 12% but inflation is 6%, your "Real Return" is effectively only 6%. Using our <strong>Inflation Adjustment</strong> toggle helps you understand what your future wealth will actually buy in today's grocery prices, helping you set more realistic financial targets.</p>
        </section>
    </Layout>
  );
};

export default MutualFundCalculator;