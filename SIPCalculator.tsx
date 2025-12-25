import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  calculateSIP, 
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';

const COLORS = ['#3b82f6', '#10b981']; // Blue for Invested, Green for Returns

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'USD ($)' },
  { code: 'INR', name: 'INR (₹)' },
  { code: 'EUR', name: 'EUR (€)' },
  { code: 'GBP', name: 'GBP (£)' },
  { code: 'JPY', name: 'JPY (¥)' },
  { code: 'AED', name: 'AED (د.إ)' },
];

const SIPCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currency, setCurrency] = useState<string>('USD');
  
  // SIP Input State
  const [investment, setInvestment] = useState<number>(500);
  const [rate, setRate] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  
  // Initialize from URL parameters if present
  useEffect(() => {
    if (searchParams.has('curr')) setCurrency(searchParams.get('curr')!);
    if (searchParams.has('inv')) setInvestment(Number(searchParams.get('inv')));
    if (searchParams.has('rate')) setRate(Number(searchParams.get('rate')));
    if (searchParams.has('yrs')) setYears(Number(searchParams.get('yrs')));
    
    if (!searchParams.has('curr')) {
        setCurrency(detectCurrencyFromLocale());
    }
  }, [searchParams]);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  // Calculation
  const result = useMemo(() => {
    return calculateSIP(investment, rate, years);
  }, [investment, rate, years]);

  const chartData = useMemo(() => [
    { name: 'Invested Amount', value: result.investedAmount },
    { name: 'Est. Returns', value: result.estReturns }
  ], [result]);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textColor = 'white';

    return (
      <text 
        x={x} 
        y={y} 
        fill={textColor} 
        textAnchor="middle" 
        dominantBaseline="central" 
        style={{ fontSize: '13px', fontWeight: 800, pointerEvents: 'none', textShadow: '0px 0px 2px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', marginBottom: '40px' }}>
        <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: '32px', height: '32px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px' }}>
              <i className="fas fa-chart-line"></i>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>SIP <span style={{color:'#10b981'}}>Calculator</span></span>
          </div>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, fontSize: '13px', color: '#334155', cursor: 'pointer', outline: 'none' }}
          >
            {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="container" style={{ flex: 1 }}>
        <div className="calc-wrapper">
          {/* Left Panel: Inputs */}
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Investment Details
            </h2>
            
            <SliderInput 
              label="Monthly Investment" 
              value={investment} 
              min={500} 
              max={1000000} 
              step={500} 
              onChange={setInvestment} 
              prefix={symbol}
            />

            <SliderInput 
              label="Expected Return Rate (p.a)" 
              value={rate} 
              min={1} 
              max={30} 
              step={0.1} 
              onChange={setRate} 
              suffix={<span className="unit-label">%</span>}
            />

            <SliderInput 
              label="Time Period" 
              value={years} 
              min={1} 
              max={40} 
              step={1} 
              onChange={setYears} 
              suffix={<span className="unit-label">Years</span>}
            />

            <div style={{ marginTop: '32px', background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-lightbulb"></i> Wealth Tip
              </h3>
              <p style={{ fontSize: '13px', color: '#1e3a8a', margin: 0, lineHeight: '1.5' }}>
                Increasing your SIP by just <strong>10% annually</strong> (Step-up SIP) can nearly double your wealth corpus over long tenures compared to a fixed SIP.
              </p>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Total Value</div>
                <div className="result-amount" style={{ color: '#10b981' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Invested Amount</span>
                  <span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Est. Returns</span>
                  <span className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(result.estReturns, currency)}</span>
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
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value, entry: any) => <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>© {new Date().getFullYear()} Smart EMI Pro. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIPCalculator;