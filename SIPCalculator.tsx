import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateSIP, 
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const COLORS = ['#3b82f6', '#10b981'];

const SIPCalculator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currency, setCurrency] = useState<string>('USD');
  const [investment, setInvestment] = useState<number>(500);
  const [rate, setRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [stepUpRate, setStepUpRate] = useState<number>(0);
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6);

  useEffect(() => {
    if (searchParams.has('curr')) setCurrency(searchParams.get('curr')!);
    if (searchParams.has('inv')) setInvestment(Number(searchParams.get('inv')));
    if (searchParams.has('rate')) setRate(Number(searchParams.get('rate')));
    if (searchParams.has('yrs')) setYears(Number(searchParams.get('yrs')));
    if (searchParams.has('step') || searchParams.has('inf')) setShowAdvanced(true);
    if (!searchParams.has('curr')) setCurrency(detectCurrencyFromLocale());
  }, [searchParams]);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const result = useMemo(() => {
    const rawResult = calculateSIP(investment, rate, years, stepUpRate);
    if (adjustInflation) {
      const inflationFactor = Math.pow(1 + inflationRate / 100, years);
      const realTotalValue = rawResult.totalValue / inflationFactor;
      return { investedAmount: rawResult.investedAmount, estReturns: realTotalValue - rawResult.investedAmount, totalValue: realTotalValue, isInflationAdjusted: true };
    }
    return { ...rawResult, isInflationAdjusted: false };
  }, [investment, rate, years, stepUpRate, adjustInflation, inflationRate]);

  const chartData = [{ name: 'Invested Amount', value: result.investedAmount }, { name: 'Est. Returns', value: Math.max(0, result.estReturns) }];

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
    <Layout title="SIP" titleHighlight="Calculator" icon="fas fa-chart-line" iconColor="#10b981" currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .formula-box { background: #f0fdf4; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981; font-family: monospace; font-size: 16px; margin: 20px 0; }
        `}</style>
        
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>Investment Details</h2>
            <SliderInput label="Monthly Investment" value={investment} min={500} max={1000000} step={500} onChange={setInvestment} prefix={symbol} />
            <SliderInput label="Expected Return Rate (p.a)" value={rate} min={1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Time Period" value={years} min={1} max={40} step={1} onChange={setYears} suffix="Years" />
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">{result.isInflationAdjusted ? 'Total Value (Real)' : 'Total Value'}</div>
                <div className="result-amount" style={{ color: '#10b981' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Invested Amount</span><span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Est. Returns</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span></div>
             </div>
             <div style={{ width: '100%', height: '220px', marginTop: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="#f8fafc" strokeWidth={4} label={renderPieLabel} labelLine={false}>
                      {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <section className="seo-section">
          <h2>Master Your Wealth with Systematic Investment Plans (SIP)</h2>
          <p>
            A <strong>Systematic Investment Plan (SIP)</strong> is a disciplined way of investing in mutual funds or other assets. Instead of a large lump sum, you invest a fixed amount regularly (monthly, quarterly, etc.). This approach leverages <strong>Rupee Cost Averaging</strong> and the <strong>Power of Compounding</strong>.
          </p>

          <h3>The SIP Wealth Formula</h3>
          <p>The future value of a regular SIP is calculated using the following mathematical expression:</p>
          <div className="formula-box">
            FV = P &times; [((1 + i)^n - 1) / i] &times; (1 + i)
          </div>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>FV</strong> is the Future Value of the investment.</li>
            <li><strong>P</strong> is the monthly investment amount.</li>
            <li><strong>i</strong> is the monthly rate of interest (Annual Rate / 12 / 100).</li>
            <li><strong>n</strong> is the number of months of investment.</li>
          </ul>

          <h3>Why SIP is Better than Lump Sum?</h3>
          <p>
            SIPs eliminate the need to "time the market." When markets are high, your fixed investment buys fewer units. When markets are low, you buy more units. Over the long term, this lowers your average cost per unit. This is why SIPs are the preferred method for long-term goals like retirement or children's education.
          </p>
        </section>
    </Layout>
  );
};

export default SIPCalculator;