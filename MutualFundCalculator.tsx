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
  
  // Basic State
  const [amount, setAmount] = useState<number>(5000);
  const [rate, setRate] = useState<number>(12);
  const [years, setYears] = useState<number>(5);

  // Advanced State
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [stepUpRate, setStepUpRate] = useState<number>(0);
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  // Handle default amounts when switching modes to be user-friendly
  const handleModeChange = (newMode: 'sip' | 'lumpsum') => {
    setMode(newMode);
    if (newMode === 'sip') {
      setAmount(5000); // Default monthly
    } else {
      setAmount(50000); // Default lumpsum
    }
  };

  const result = useMemo(() => {
    let rawResult;
    
    if (mode === 'sip') {
      // calculateSIP supports stepUpRate as 4th argument
      rawResult = calculateSIP(amount, rate, years, stepUpRate);
    } else {
      // LumpSum doesn't support stepUp (it's one time)
      rawResult = calculateLumpSum(amount, rate, years);
    }

    // Apply Inflation Adjustment
    if (adjustInflation) {
      // Formula for Real Value: FV / (1 + inflation)^years
      const inflationFactor = Math.pow(1 + inflationRate / 100, years);
      const realTotalValue = rawResult.totalValue / inflationFactor;
      
      return {
        investedAmount: rawResult.investedAmount,
        estReturns: realTotalValue - rawResult.investedAmount,
        totalValue: realTotalValue,
        isInflationAdjusted: true
      };
    }

    return { ...rawResult, isInflationAdjusted: false };
  }, [mode, amount, rate, years, stepUpRate, adjustInflation, inflationRate]);

  // Handle negative returns display for charts (if inflation > returns)
  const chartData = useMemo(() => {
    const returns = Math.max(0, result.estReturns);
    return [
      { name: 'Invested Amount', value: result.investedAmount },
      { name: 'Est. Returns', value: returns }
    ];
  }, [result]);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 800, pointerEvents: 'none', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Layout 
      title="Mutual Fund" 
      titleHighlight="Returns" 
      icon="fas fa-chart-pie" 
      iconColor="#8b5cf6"
      currency={currency}
      onCurrencyChange={setCurrency}
    >
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Investment Details
            </h2>
            
            <div style={{ marginBottom: '32px' }}>
                <div className="toggle-group" style={{ width: '100%', display: 'flex' }}>
                    <button 
                        className={`toggle-btn ${mode === 'sip' ? 'active' : ''}`} 
                        onClick={() => handleModeChange('sip')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        SIP
                    </button>
                    <button 
                        className={`toggle-btn ${mode === 'lumpsum' ? 'active' : ''}`} 
                        onClick={() => handleModeChange('lumpsum')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        Lumpsum
                    </button>
                </div>
            </div>

            <SliderInput 
              label={mode === 'sip' ? "Monthly Investment" : "Total Investment"} 
              value={amount} 
              min={500} 
              max={mode === 'sip' ? 100000 : 10000000} 
              step={500} 
              onChange={setAmount} 
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

            {/* Advanced Section */}
            <div style={{ marginTop: '32px' }}>
               <button 
                 onClick={() => setShowAdvanced(!showAdvanced)}
                 style={{ 
                   width: '100%',
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'space-between', 
                   background: showAdvanced ? '#f5f3ff' : '#f8fafc', 
                   border: '1px solid #e2e8f0',
                   padding: '16px 20px',
                   borderRadius: showAdvanced ? '16px 16px 0 0' : '16px',
                   cursor: 'pointer',
                   transition: 'all 0.2s',
                   outline: 'none'
                 }}
               >
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', 
                        background: '#8b5cf6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px'
                    }}>
                        <i className="fas fa-sliders-h"></i>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Advanced Options</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                            {mode === 'sip' ? 'Step-up & Inflation' : 'Inflation Adjustment'}
                        </p>
                    </div>
                 </div>
                 
                 <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'white', 
                    border: '1px solid #cbd5e1',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '12px',
                    transition: 'transform 0.2s',
                    transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)'
                 }}>
                    <i className="fas fa-chevron-down"></i>
                 </div>
               </button>
               
               {showAdvanced && (
                 <div style={{ 
                   background: '#f8fafc', 
                   border: '1px solid #e2e8f0', 
                   borderTop: 'none', 
                   borderRadius: '0 0 16px 16px', 
                   padding: '24px 20px',
                   boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                 }}>
                   
                   {/* Step Up - Only for SIP */}
                   {mode === 'sip' && (
                       <div style={{ marginBottom: '28px' }}>
                           <SliderInput 
                              label="Annual Step-up (Increase)" 
                              value={stepUpRate} 
                              min={0} 
                              max={50} 
                              step={1} 
                              onChange={setStepUpRate} 
                              suffix={<span className="unit-label">%</span>}
                            />
                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '-20px', marginBottom: '0' }}>
                               Increase monthly investment by {stepUpRate}% every year.
                            </p>
                       </div>
                   )}

                   {/* Inflation Adjustment */}
                   <div style={{ borderTop: mode === 'sip' ? '1px solid #e2e8f0' : 'none', paddingTop: mode === 'sip' ? '24px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <label style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Adjust for Inflation</label>
                          <div 
                            onClick={() => setAdjustInflation(!adjustInflation)}
                            style={{
                                width: '48px', height: '26px', background: adjustInflation ? '#8b5cf6' : '#cbd5e1',
                                borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                          >
                              <div style={{
                                  width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                                  position: 'absolute', top: '3px', left: adjustInflation ? '25px' : '3px',
                                  transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                              }}></div>
                          </div>
                      </div>

                      {adjustInflation && (
                          <SliderInput 
                            label="Inflation Rate" 
                            value={inflationRate} 
                            min={1} 
                            max={15} 
                            step={0.1} 
                            onChange={setInflationRate} 
                            suffix={<span className="unit-label">%</span>}
                          />
                      )}
                      {adjustInflation && (
                          <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '-20px', marginBottom: '0', fontWeight: 500 }}>
                             Results show "Present Value" (purchasing power today).
                          </p>
                      )}
                   </div>

                 </div>
               )}
            </div>

            <div style={{ marginTop: '32px', background: '#f5f3ff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#5b21b6', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-info-circle"></i> Info
              </h3>
              <p style={{ fontSize: '13px', color: '#4c1d95', margin: 0, lineHeight: '1.5' }}>
                {mode === 'sip' 
                    ? "SIP allows you to invest small amounts regularly. Use Step-up to increase your investment annually as your income grows."
                    : "Lumpsum is a one-time investment. Adjusting for inflation helps you understand the real value of your corpus in the future."
                }
              </p>
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">
                    {result.isInflationAdjusted ? 'Total Value (Inflation Adjusted)' : 'Total Value'}
                </div>
                <div className="result-amount" style={{ color: '#8b5cf6' }}>{formatCurrency(result.totalValue, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Invested Amount</span>
                  <span className="stat-value">{formatCurrency(result.investedAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Est. Returns {result.isInflationAdjusted ? '(Real)' : ''}</span>
                  <span className="stat-value" style={{ color: result.estReturns >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(result.estReturns, currency)}
                  </span>
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
          </div>
        </div>
    </Layout>
  );
};

export default MutualFundCalculator;