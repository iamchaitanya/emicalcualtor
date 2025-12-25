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
  const [currency, setCurrency] = useState<string>('INR'); // APY is specific to India usually, but we allow currency switch for display
  
  const [age, setAge] = useState<number>(25);
  const [pension, setPension] = useState<number>(5000);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    return calculateAtalPensionYojana(age, pension);
  }, [age, pension]);

  const chartData = useMemo(() => [
    { name: 'Total Investment', value: result.investedAmount },
    { name: 'Govt. Contribution / Return', value: result.estReturns }
  ], [result]);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 800, pointerEvents: 'none', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const pensionOptions = [1000, 2000, 3000, 4000, 5000];

  return (
    <Layout 
      title="Atal Pension Yojana" 
      titleHighlight="(APY)" 
      icon="fas fa-landmark" 
      iconColor="#e11d48"
      currency={currency}
      onCurrencyChange={setCurrency}
    >
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Subscriber Details
            </h2>
            
            <SliderInput 
              label="Current Age" 
              value={age} 
              min={18} 
              max={40} 
              step={1} 
              onChange={setAge} 
              suffix={<span className="unit-label">Years</span>}
            />

            <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
                   Desired Monthly Pension (at 60)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {pensionOptions.map((p) => (
                        <button 
                            key={p}
                            onClick={() => setPension(p)}
                            style={{ 
                                padding: '12px 16px', 
                                borderRadius: '10px', 
                                border: pension === p ? '2px solid #e11d48' : '1px solid #e2e8f0', 
                                background: pension === p ? '#fff1f2' : 'white', 
                                color: pension === p ? '#be123c' : '#64748b', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                fontSize: '13px',
                                flex: '1 0 15%'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '32px', background: '#fff1f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#be123c', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-info-circle"></i> Scheme Info
              </h3>
              <p style={{ fontSize: '13px', color: '#9f1239', margin: 0, lineHeight: '1.5' }}>
                You will pay the monthly contribution for <strong>{result.yearsToPay} years</strong> (until age 60). After 60, you receive a guaranteed pension of <strong>{formatCurrency(pension, currency)}</strong>/mo.
              </p>
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Monthly Contribution</div>
                <div className="result-amount" style={{ color: '#e11d48' }}>{formatCurrency(result.monthlyContribution, currency)}</div>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    Investment duration: {result.yearsToPay} Years
                </p>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Investment</span>
                  <span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Corpus to Nominee</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.corpusToNominee, currency)}</span>
                </div>
             </div>

             <div style={{ width: '100%', height: '220px', marginTop: '24px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      dataKey="value" 
                      stroke="#f8fafc"
                      strokeWidth={4}
                      label={renderLabel}
                      labelLine={false}
                    >
                      {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             
             <div style={{ marginTop: '24px', background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                 <p style={{ margin: 0, fontSize: '12px', color: '#15803d', lineHeight: '1.5' }}>
                     In case of death of the subscriber, the pension corpus of {formatCurrency(result.corpusToNominee, currency)} is returned to the nominee.
                 </p>
             </div>
          </div>
        </div>
    </Layout>
  );
};

export default APYCalculator;