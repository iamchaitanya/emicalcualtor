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
          .formula-box { background: #f5f3ff; padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6; font-family: monospace; font-size: 16px; margin: 20px 0; }
          .chart-container { height: 220px; width: 100%; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Details</h2>
            <div className="toggle-group" style={{ width: '100%', display: 'flex', marginBottom: '32px' }}>
                <button className={`toggle-btn ${mode === 'sip' ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setMode('sip')}>SIP</button>
                <button className={`toggle-btn ${mode === 'lumpsum' ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setMode('lumpsum')}>Lumpsum</button>
            </div>
            <SliderInput label={mode === 'sip' ? "Monthly" : "One-time"} value={amount} min={500} max={1000000} step={500} onChange={setAmount} prefix={symbol} />
            <SliderInput label="Returns Rate" value={rate} min={1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Years" value={years} min={1} max={40} step={1} onChange={setYears} suffix="Y" />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">{result.isInflationAdjusted ? 'Real Value (Adjusted)' : 'Total Value'}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Invested</span><span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Returns</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
             </div>
             <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={75} dataKey="value" stroke="#f8fafc" strokeWidth={4} label={renderPieLabel} labelLine={false}>
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
          <h2>Choosing Between SIP and Lumpsum in Mutual Funds</h2>
          <p>
            Mutual funds allow you to grow your wealth by investing in a diversified portfolio of stocks or bonds. You can choose to invest via a <strong>Systematic Investment Plan (SIP)</strong> for regular savings or a <strong>Lumpsum</strong> for one-time investments.
          </p>

          <h3>Inflation Impact on Mutual Funds</h3>
          <p>
            A common mistake in financial planning is ignoring <strong>Inflation</strong>. If your fund returns 12% but inflation is 6%, your real wealth growth is only 6%. Our calculator helps you visualize the "Present Value" of your future corpus.
          </p>
          <div className="formula-box">Real Value = Future Value / (1 + Inflation Rate)^Years</div>

          <h3>Why Step-Up SIP is a Game Changer?</h3>
          <p>
            As your income increases, you should increase your SIP amount. A small 10% annual increase (Step-up) can lead to a 2x higher corpus compared to a flat SIP over 20 years.
          </p>
        </section>
    </Layout>
  );
};

export default MutualFundCalculator;