import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateAtalPensionYojana,
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const COLORS = ['#3b82f6', '#10b981'];

const APYCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<string>('INR');
  const [age, setAge] = useState<number>(25);
  const [pension, setPension] = useState<number>(5000);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const result = useMemo(() => calculateAtalPensionYojana(age, pension), [age, pension]);

  const chartData = [{ name: 'Investment', value: result.investedAmount }, { name: 'Growth', value: result.estReturns }];

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
    <Layout title="Atal Pension" titleHighlight="(APY)" icon="fas fa-landmark" iconColor="#e11d48" currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .formula-box { background: #fff1f2; padding: 20px; border-radius: 12px; border-left: 4px solid #e11d48; font-family: monospace; font-size: 16px; margin: 20px 0; }
          .chart-container { height: 220px; min-height: 220px; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Subscriber Info</h2>
            <SliderInput label="Your Age" value={age} min={18} max={40} step={1} onChange={setAge} suffix="Y" />
            <div style={{ marginTop: '24px' }}>
                <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px', display: 'block' }}>Monthly Pension</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[1000, 2000, 3000, 4000, 5000].map(p => (
                        <button key={p} onClick={() => setPension(p)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: pension === p ? '2px solid #e11d48' : '1px solid #e2e8f0', background: pension === p ? '#fff1f2' : 'white', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>{p}</button>
                    ))}
                </div>
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Monthly Contribution</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#e11d48' }}>{formatCurrency(result.monthlyContribution, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Payable For</span><span className="stat-value">{result.yearsToPay} Years</span></div>
                <div className="stat-item"><span className="stat-label">Nominee Corpus</span><span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.corpusToNominee, currency)}</span></div>
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
          <h2>Atal Pension Yojana (APY): Secure Your Future</h2>
          <p>
            APY is a social security scheme launched by the Govt of India to provide a fixed pension to workers in the unorganized sector. The scheme guarantees a monthly pension of ₹1,000 to ₹5,000 after age 60.
          </p>

          <h3>Age vs. Contribution</h3>
          <p>
            The earlier you start, the lower your contribution. For example, starting at 18 for a ₹5,000 pension requires only ₹210/month, while starting at 40 requires ₹1,454/month.
          </p>

          <h3>Benefits for the Nominee</h3>
          <p>In case of the subscriber's death, the pension continues for the spouse. If both pass away, the accumulated corpus is returned to the nominee.</p>
        </section>
    </Layout>
  );
};

export default APYCalculator;