import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  calculateEMI, 
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import { downloadExcel, downloadPDF } from './utils/exportUtils';
import SliderInput from './components/SliderInput';
import AmortizationSchedule from './components/AmortizationSchedule';
import Layout from './components/Layout';
import { CustomPrepayment } from './types';

const COLORS = ['#3b82f6', '#cbd5e1'];

const EMICalculator: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [currency, setCurrency] = useState<string>('USD');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 7));
  
  // EMI Input State (Form)
  const [amount, setAmount] = useState<number>(500000);
  const [rate, setRate] = useState<number>(9.5);
  const [tenure, setTenure] = useState<number>(20);
  const [tenureType, setTenureType] = useState<'yr' | 'mo'>('yr');
  
  // Advanced Input State
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [moratorium, setMoratorium] = useState<number>(0);
  const [mMode, setMMode] = useState<'pay' | 'capitalize-simple' | 'capitalize-compound'>('capitalize-simple');
  
  // Prepayment State
  const [prepayAmount, setPrepayAmount] = useState<number>(0); // Used for monthly/yearly
  const [prepayFreq, setPrepayFreq] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  
  // Custom Payments List
  const [customPayments, setCustomPayments] = useState<CustomPrepayment[]>([
    { id: '1', month: 12, amount: 0 }
  ]);

  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Initialize from URL parameters
  useEffect(() => {
    if (searchParams.has('curr')) setCurrency(searchParams.get('curr')!);
    if (searchParams.has('amt')) setAmount(Number(searchParams.get('amt')));
    if (searchParams.has('rate')) setRate(Number(searchParams.get('rate')));
    if (searchParams.has('ten')) setTenure(Number(searchParams.get('ten')));
    if (searchParams.has('tt')) setTenureType(searchParams.get('tt') as 'yr' | 'mo');
    if (searchParams.has('sd')) setStartDate(searchParams.get('sd')!);
    if (searchParams.has('mor')) setMoratorium(Number(searchParams.get('mor')));
    if (searchParams.has('mm')) setMMode(searchParams.get('mm') as any);
    if (searchParams.has('pa')) setPrepayAmount(Number(searchParams.get('pa')));
    if (searchParams.has('pf')) setPrepayFreq(searchParams.get('pf') as any);
    
    if (searchParams.has('cp')) {
      try {
        const decoded = atob(searchParams.get('cp')!);
        setCustomPayments(JSON.parse(decoded));
      } catch (e) {
        console.error("Failed to parse custom payments", e);
      }
    }
    
    // Open advanced if any advanced setting is present in URL
    if (searchParams.has('mor') || searchParams.has('pa') || searchParams.has('pf') || searchParams.has('cp')) {
        setShowAdvanced(true);
    }
    
    if (!searchParams.has('curr')) {
        setCurrency(detectCurrencyFromLocale());
    }
  }, [searchParams]);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  
  const totalMonths = useMemo(() => tenureType === 'yr' ? tenure * 12 : tenure, [tenure, tenureType]);

  // Generate month options for dropdown
  const monthOptions = useMemo(() => {
    const [startYear, startMonth] = startDate.split('-').map(Number);
    return Array.from({ length: totalMonths }, (_, i) => {
      const monthIndex = i + 1;
      const date = new Date(startYear, (startMonth - 1) + i);
      const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return { value: monthIndex, label: `${monthIndex}. ${label}` };
    });
  }, [totalMonths, startDate]);

  // Reactive Calculation
  const emiResult = useMemo(() => {
    return calculateEMI({
      principal: amount, 
      interestRate: rate, 
      tenure: totalMonths,
      moratoriumMonths: moratorium, 
      moratoriumInterestMode: mMode,
      prepayment: {
        amount: prepayAmount,
        frequency: prepayFreq,
        customPayments: customPayments
      }
    });
  }, [amount, rate, totalMonths, moratorium, mMode, prepayAmount, prepayFreq, customPayments]);

  const chartData = useMemo(() => [
    { name: 'Principal', value: amount },
    { name: 'Interest', value: emiResult.totalInterest }
  ], [amount, emiResult]);

  // Handlers for Custom Payments
  const addCustomPayment = () => {
    const newId = Date.now().toString() + Math.random().toString().slice(2, 5);
    setCustomPayments(prev => [...prev, { id: newId, month: 1, amount: 0 }]);
  };

  const removeCustomPayment = (id: string) => {
    setCustomPayments(prev => prev.filter(p => p.id !== id));
  };

  const updateCustomPayment = (id: string, field: 'month' | 'amount', value: number) => {
    setCustomPayments(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textColor = index === 1 ? '#1e293b' : 'white';

    return (
      <text 
        x={x} 
        y={y} 
        fill={textColor} 
        textAnchor="middle" 
        dominantBaseline="central" 
        style={{ fontSize: '13px', fontWeight: 800, pointerEvents: 'none' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const generateShareLink = () => {
    const params = new URLSearchParams();
    params.set('curr', currency);
    params.set('amt', amount.toString());
    params.set('rate', rate.toString());
    params.set('ten', tenure.toString());
    params.set('tt', tenureType);
    params.set('sd', startDate);
    
    if (moratorium > 0) {
      params.set('mor', moratorium.toString());
      params.set('mm', mMode);
    }
    
    if (prepayAmount > 0 || prepayFreq !== 'monthly') {
       params.set('pa', prepayAmount.toString());
       params.set('pf', prepayFreq);
    }

    if (prepayFreq === 'custom' && customPayments.length > 0) {
       params.set('cp', btoa(JSON.stringify(customPayments)));
    }

    const newUrl = `${window.location.origin}${window.location.pathname}#/emi-calculator?${params.toString()}`;
    
    navigator.clipboard.writeText(newUrl).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 3000);
    });
  };

  return (
    <Layout 
      title="EMI Calculator" 
      icon="fas fa-calculator" 
      iconColor="#3b82f6"
      currency={currency}
      onCurrencyChange={setCurrency}
    >
        <div className="calc-wrapper">
          {/* Left Panel: Inputs */}
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Enter Loan Details
            </h2>
            
            <SliderInput 
              label="Loan Amount" 
              value={amount} 
              min={1000} 
              max={10000000} 
              step={1000} 
              onChange={setAmount} 
              prefix={symbol}
            />

            <SliderInput 
              label="Interest Rate" 
              value={rate} 
              min={0.1} 
              max={30} 
              step={0.1} 
              onChange={setRate} 
              suffix={<span className="unit-label">%</span>}
            />

            <SliderInput 
              label="Loan Tenure" 
              value={tenure} 
              min={1} 
              max={tenureType === 'yr' ? 40 : 480} 
              step={1} 
              onChange={setTenure} 
              suffix={
                <div className="toggle-group">
                  <button className={`toggle-btn ${tenureType === 'yr' ? 'active' : ''}`} onClick={() => setTenureType('yr')}>Yr</button>
                  <button className={`toggle-btn ${tenureType === 'mo' ? 'active' : ''}`} onClick={() => setTenureType('mo')}>Mo</button>
                </div>
              }
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
                   background: showAdvanced ? '#eff6ff' : '#f8fafc', 
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
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px'
                    }}>
                        <i className="fas fa-sliders-h"></i>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Advanced Options</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>Prepayments, moratorium & more</p>
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
                   
                   {/* 1. Moratorium */}
                   <SliderInput 
                      label="Moratorium (Holiday Period)" 
                      value={moratorium} 
                      min={0} 
                      max={24} 
                      step={1} 
                      onChange={setMoratorium} 
                      suffix={<span className="unit-label">Months</span>}
                    />

                    {moratorium > 0 && (
                      <div style={{ marginTop: '-12px', background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interest Treatment during Moratorium</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => setMMode('pay')}
                            style={{ flex: '1 1 100px', padding: '12px', borderRadius: '8px', border: mMode === 'pay' ? '2px solid #3b82f6' : '1px solid #cbd5e1', background: mMode === 'pay' ? '#eff6ff' : 'white', color: mMode === 'pay' ? '#1d4ed8' : '#475569', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Pay Monthly
                          </button>
                          <button 
                             onClick={() => setMMode('capitalize-simple')}
                             style={{ flex: '1 1 100px', padding: '12px', borderRadius: '8px', border: mMode === 'capitalize-simple' ? '2px solid #3b82f6' : '1px solid #cbd5e1', background: mMode === 'capitalize-simple' ? '#eff6ff' : 'white', color: mMode === 'capitalize-simple' ? '#1d4ed8' : '#475569', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Add to Principal (At End)
                          </button>
                          <button 
                             onClick={() => setMMode('capitalize-compound')}
                             style={{ flex: '1 1 100px', padding: '12px', borderRadius: '8px', border: mMode === 'capitalize-compound' ? '2px solid #3b82f6' : '1px solid #cbd5e1', background: mMode === 'capitalize-compound' ? '#eff6ff' : 'white', color: mMode === 'capitalize-compound' ? '#1d4ed8' : '#475569', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Add to Principal (Monthly)
                          </button>
                        </div>
                      </div>
                    )}

                   {/* 2. Prepayments */}
                   <div style={{ marginBottom: '28px' }}>
                     <label style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
                       Prepayments
                     </label>
                     
                     <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                       {['monthly', 'yearly', 'custom'].map((freq) => (
                         <button
                           key={freq}
                           onClick={() => setPrepayFreq(freq as any)}
                           style={{
                             flex: '1',
                             minWidth: '80px',
                             padding: '10px',
                             borderRadius: '10px',
                             border: prepayFreq === freq ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                             background: prepayFreq === freq ? '#eff6ff' : 'white',
                             color: prepayFreq === freq ? '#1d4ed8' : '#64748b',
                             fontWeight: 700,
                             fontSize: '13px',
                             textTransform: 'capitalize',
                             cursor: 'pointer',
                             transition: 'all 0.2s'
                           }}
                         >
                           {freq}
                         </button>
                       ))}
                     </div>

                     {(prepayFreq === 'monthly' || prepayFreq === 'yearly') && (
                       <SliderInput 
                          label={prepayFreq === 'monthly' ? "Monthly Payment" : "Yearly Payment"} 
                          value={prepayAmount} 
                          min={0} 
                          max={amount}
                          step={100} 
                          onChange={setPrepayAmount} 
                          prefix={symbol}
                        />
                     )}

                     {prepayFreq === 'custom' && (
                       <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span style={{ flex: '2', minWidth: '100px' }}>Month</span>
                            <span style={{ flex: '1', minWidth: '80px' }}>Amount ({symbol})</span>
                            <span style={{ width: '30px' }}></span>
                          </div>
                          
                          {customPayments.map((payment) => (
                             <div key={payment.id} style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                                <select 
                                  value={payment.month}
                                  onChange={(e) => updateCustomPayment(payment.id, 'month', Number(e.target.value))}
                                  style={{ 
                                    flex: '2', minWidth: '100px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                                    fontWeight: 600, color: '#1e293b', outline: 'none', cursor: 'pointer', backgroundColor: 'white',
                                    fontSize: '13px'
                                  }}
                                >
                                  {monthOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>

                                <input 
                                  type="number"
                                  min={0}
                                  value={payment.amount}
                                  onChange={(e) => updateCustomPayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                  placeholder="Amount"
                                  style={{ 
                                    flex: '1', minWidth: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                                    fontWeight: 700, color: '#1e293b', outline: 'none',
                                    fontSize: '13px'
                                  }}
                                />
                                <button 
                                  onClick={() => removeCustomPayment(payment.id)}
                                  style={{ 
                                    width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#fee2e2', 
                                    color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                  title="Remove payment"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                             </div>
                          ))}

                          <button 
                             onClick={addCustomPayment}
                             style={{ 
                               width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed #3b82f6', 
                               background: '#eff6ff', color: '#3b82f6', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px'
                             }}
                          >
                            <i className="fas fa-plus"></i> Add Payment
                          </button>
                       </div>
                     )}
                   </div>

                   {/* 3. Start Date */}
                   <div style={{ marginBottom: '28px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <label style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', flex: '0 0 200px' }}>Start Month</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '200px', justifyContent: 'flex-end' }}>
                                <input 
                                    type="month" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        outline: 'none',
                                        color: '#1e293b',
                                        fontFamily: 'inherit',
                                        background: '#ffffff',
                                        cursor: 'pointer',
                                        textAlign: 'right'
                                    }}
                                />
                            </div>
                        </div>
                   </div>

                 </div>
               )}
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Monthly Payment (EMI)</div>
                <div className="result-amount" style={{ color: '#3b82f6' }}>{formatCurrency(emiResult.emi, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Principal Amount</span>
                  <span className="stat-value">{formatCurrency(amount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Interest</span>
                  <span className="stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(emiResult.totalInterest, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Amount</span>
                  <span className="stat-value">{formatCurrency(emiResult.totalPayment, currency)}</span>
                </div>
             </div>

             <div style={{ width: '100%', height: '200px', marginTop: '24px' }}>
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
                  </PieChart>
                </ResponsiveContainer>
             </div>
             
             <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '0', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[0] }}></div>
                   <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Principal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[1] }}></div>
                   <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Interest</span>
                </div>
             </div>
          </div>
        </div>

        {/* Schedule */}
        <div style={{ marginTop: '32px' }}>
           <AmortizationSchedule data={emiResult.amortization} currencyCode={currency} startDate={startDate} />
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => downloadExcel(emiResult.amortization)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#10b981',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
              transition: 'transform 0.1s',
              minWidth: '150px',
              justifyContent: 'center'
            }}
          >
            <i className="fas fa-file-excel"></i> Download Excel
          </button>

          <button 
            onClick={() => downloadPDF(emiResult.amortization, amount, rate, totalMonths, currency)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
              transition: 'transform 0.1s',
              minWidth: '150px',
              justifyContent: 'center'
            }}
          >
            <i className="fas fa-file-pdf"></i> Download PDF
          </button>

          <button 
            onClick={generateShareLink}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
              transition: 'transform 0.1s',
              minWidth: '150px',
              justifyContent: 'center'
            }}
          >
            {shareLinkCopied ? (
               <><i className="fas fa-check"></i> Link Copied!</>
            ) : (
               <><i className="fas fa-share-alt"></i> Share Calculation</>
            )}
          </button>
        </div>
    </Layout>
  );
};

export default EMICalculator;