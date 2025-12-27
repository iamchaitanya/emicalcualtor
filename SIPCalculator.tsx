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
          .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
          .formula-box { background: #f0fdf4; padding: 24px; border-radius: 12px; border-left: 4px solid #10b981; font-family: 'Inter', monospace; font-size: 18px; font-weight: 700; margin: 24px 0; color: #166534; text-align: center; overflow-x: auto; }
          
          .advanced-toggle-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f0fdf4;
            color: #166534;
            border: 1px dashed #10b981;
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
          @media (max-width: 600px) {
            .seo-section { padding: 24px 20px; }
            .formula-box { font-size: 15px; padding: 16px; }
          }
        `}</style>
        
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>Investment Details</h2>
            <SliderInput label="Monthly Investment" value={investment} min={500} max={1000000} step={500} onChange={setInvestment} prefix={symbol} />
            <SliderInput label="Expected Return Rate (p.a)" value={rate} min={1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Time Period" value={years} min={1} max={40} step={1} onChange={setYears} suffix="Years" />

            <button className="advanced-toggle-btn" onClick={() => setShowAdvanced(!showAdvanced)}>
              <i className={`fas fa-${showAdvanced ? 'minus-circle' : 'plus-circle'}`}></i>
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>

            {showAdvanced && (
              <div className="advanced-panel">
                <div style={{ marginBottom: '24px' }}>
                  <SliderInput label="Annual Step-Up (%)" value={stepUpRate} min={0} max={50} step={1} onChange={setStepUpRate} suffix="%" />
                </div>
                <div style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>Adjust for Inflation</span>
                    <button onClick={() => setAdjustInflation(!adjustInflation)} style={{ background: adjustInflation ? '#10b981' : '#e2e8f0', border: 'none', width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative' }}>
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
            A <strong>Systematic Investment Plan (SIP)</strong> is the most disciplined and effective way to invest in mutual funds and build long-term wealth. Unlike lumpsum investments, SIPs allow you to invest a small, fixed amount regularly, leveraging the market's natural cycles to your advantage.
          </p>

          <h3>The SIP Return Formula</h3>
          <p>The calculation of SIP returns uses the formula for <strong>Future Value of an Annuity</strong>. This accounts for compound interest applied to each individual monthly contribution:</p>
          <div className="formula-box">
            FV = P &times; [ ( (1 + i)^n - 1 ) / i ] &times; (1 + i)
          </div>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>FV:</strong> Future Value (The wealth you accumulate)</li>
            <li><strong>P:</strong> Monthly Investment Amount</li>
            <li><strong>i:</strong> Periodic Rate of Interest (Annual Rate / 12 / 100)</li>
            <li><strong>n:</strong> Total Number of Payments (Months)</li>
          </ul>

          <h3>Why SIPs are Better for Long-Term Goals</h3>
          
          <h3>1. The Power of Compounding</h3>
          <p>When you invest via SIP, your earnings start earning for you. Over 10, 20, or 30 years, this "interest on interest" effect grows exponentially, turning small monthly savings into massive corpuses that can fund retirement, education, or home purchases.</p>

          <h3>2. Rupee Cost Averaging</h3>
          <p>Market volatility is a friend to the SIP investor. When markets fall, your fixed monthly amount buys more units of a fund. When markets rise, you buy fewer. Over time, this averages out your cost per unit, often leading to better returns than trying to "time" the market.</p>

          <h3>3. The Step-Up SIP Advantage</h3>
          <p>As your income grows, your investments should too. A <strong>Step-up SIP</strong> (increasing your monthly contribution by a fixed percentage every year) can lead to a significantly larger final corpus compared to a static SIP. Even a 10% annual increase can nearly double your wealth over 20 years.</p>

          <h3>4. Adjusting for Inflation</h3>
          <p>Inflation erodes the purchasing power of money. A corpus of $1 Million today will not buy the same lifestyle in 20 years. This calculator's <strong>Inflation Adjustment</strong> feature helps you see the "Real Value" of your future wealth in today's terms, ensuring your financial goals are realistic.</p>
        </section>
    </Layout>
  );
};

export default SIPCalculator;