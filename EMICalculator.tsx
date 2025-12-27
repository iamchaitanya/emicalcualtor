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

const COLORS = ['#2563eb', '#94a3b8']; // Darker blue for contrast

const EMICalculator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currency, setCurrency] = useState<string>('USD');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState<number>(500000);
  const [rate, setRate] = useState<number>(9.5);
  const [tenure, setTenure] = useState<number>(20);
  const [tenureType, setTenureType] = useState<'yr' | 'mo'>('yr');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [moratorium, setMoratorium] = useState<number>(0);
  const [mMode, setMMode] = useState<'pay' | 'capitalize-simple' | 'capitalize-compound'>('capitalize-simple');
  const [prepayAmount, setPrepayAmount] = useState<number>(0);
  const [prepayFreq, setPrepayFreq] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [customPayments, setCustomPayments] = useState<CustomPrepayment[]>([{ id: '1', month: 12, amount: 0 }]);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

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
    if (!searchParams.has('curr')) setCurrency(detectCurrencyFromLocale());
  }, [searchParams]);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const totalMonths = useMemo(() => tenureType === 'yr' ? tenure * 12 : tenure, [tenure, tenureType]);

  // Generate a list of formatted months for the custom prepayment dropdown
  const monthOptions = useMemo(() => {
    const options = [];
    const [startY, startM] = startDate.split('-').map(Number);
    for (let i = 1; i <= totalMonths; i++) {
      const d = new Date(startY, (startM - 1) + (i - 1));
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      options.push({ value: i, label });
    }
    return options;
  }, [startDate, totalMonths]);
  
  const emiResult = useMemo(() => calculateEMI({
    principal: amount, interestRate: rate, tenure: totalMonths,
    moratoriumMonths: moratorium, moratoriumInterestMode: mMode,
    prepayment: { amount: prepayAmount, frequency: prepayFreq, customPayments }
  }), [amount, rate, totalMonths, moratorium, mMode, prepayAmount, prepayFreq, customPayments]);

  const chartData = [{ name: 'Principal', value: amount }, { name: 'Interest', value: emiResult.totalInterest }];

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const color = index === 0 ? 'white' : '#1e293b';

    return percent > 0.05 ? (
      <text x={x} y={y} fill={color} textAnchor="middle" dominantBaseline="central" style={{ fontSize: '13px', fontWeight: 800 }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const addCustomPayment = () => setCustomPayments([...customPayments, { id: Date.now().toString(), month: 12, amount: 0 }]);
  const updateCustomPayment = (id: string, field: 'month' | 'amount', value: number) => setCustomPayments(customPayments.map(p => p.id === id ? { ...p, [field]: value } : p));
  const removeCustomPayment = (id: string) => setCustomPayments(customPayments.filter(p => p.id !== id));

  const generateShareLink = () => {
    const params = new URLSearchParams();
    params.set('amt', amount.toString());
    params.set('rate', rate.toString());
    params.set('ten', tenure.toString());
    const newUrl = `${window.location.origin}${window.location.pathname}#/emi-calculator?${params.toString()}`;
    navigator.clipboard.writeText(newUrl).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 3000);
    });
  };

  return (
    <Layout 
      title="EMI" 
      titleHighlight="Calculator" 
      icon="fas fa-calculator" 
      iconColor="#2563eb" 
      currency={currency} 
      onCurrencyChange={setCurrency}
      description="Professional EMI Calculator with amortization schedule, moratorium support, and interest-saving prepayment projections."
    >
        <style>{`
          .chart-container { height: 200px; width: 100%; position: relative; min-height: 200px; min-width: 0; }
          .action-hub { margin-top: 32px; padding: 32px; background: #fcfdfe; border-radius: 24px; border: 1px solid #e2e8f0; }
          .action-hub-title { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
          .action-btn-row { display: flex; gap: 16px; flex-wrap: wrap; }
          .advanced-toggle-btn { display: flex; align-items: center; gap: 12px; background: #eff6ff; color: #1d4ed8; border: 1px dashed #2563eb; padding: 16px 24px; border-radius: 16px; font-weight: 800; cursor: pointer; margin-top: 32px; width: 100%; justify-content: center; transition: all 0.2s; font-size: 14px; }
          .advanced-panel { margin-top: 24px; padding: 32px; background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0; }
          .advanced-section-title { font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; display: block; }
          .custom-payment-row { display: grid; grid-template-columns: 140px 1fr 40px; gap: 12px; align-items: center; margin-bottom: 12px; }
          .custom-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-weight: 700; font-size: 14px; outline: none; width: 100%; background: white; height: 44px; }
          @media (max-width: 600px) { .stack-mobile { flex-direction: column !important; } .custom-payment-row { grid-template-columns: 1fr 1fr; } .custom-payment-row button { grid-column: span 2; } }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '24px' }}>Loan Details</h2>
            <SliderInput label="Loan Amount" value={amount} min={1000} max={10000000} step={1000} onChange={setAmount} prefix={symbol} />
            <SliderInput label="Interest Rate" value={rate} min={0.1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Tenure" value={tenure} min={1} max={tenureType === 'yr' ? 40 : 480} step={1} onChange={setTenure} 
              suffix={<div className="toggle-group"><button className={`toggle-btn ${tenureType === 'yr' ? 'active' : ''}`} onClick={() => setTenureType('yr')}>Yr</button><button className={`toggle-btn ${tenureType === 'mo' ? 'active' : ''}`} onClick={() => setTenureType('mo')}>Mo</button></div>} />
            
            <button className="advanced-toggle-btn" onClick={() => setShowAdvanced(!showAdvanced)}>
              <i className={`fas fa-${showAdvanced ? 'chevron-up' : 'cog'}`}></i>
              {showAdvanced ? 'Hide Advanced Options' : 'Moratorium & Prepayments'}
            </button>

            {showAdvanced && (
              <div className="advanced-panel">
                <div style={{ marginBottom: '32px' }}>
                  <span className="advanced-section-title">Holiday & Moratorium</span>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block' }}>Loan Start Month</label>
                    <input type="month" className="custom-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <SliderInput label="Holiday (Months)" value={moratorium} min={0} max={36} step={1} onChange={setMoratorium} />
                  {moratorium > 0 && (
                    <div className="toggle-group stack-mobile" style={{ width: '100%', marginTop: '16px' }}>
                      <button className={`toggle-btn ${mMode === 'pay' ? 'active' : ''}`} onClick={() => setMMode('pay')} style={{ flex: 1 }}>Pay Monthly</button>
                      <button className={`toggle-btn ${mMode === 'capitalize-simple' ? 'active' : ''}`} onClick={() => setMMode('capitalize-simple')} style={{ flex: 1 }}>Cap. Simple</button>
                      <button className={`toggle-btn ${mMode === 'capitalize-compound' ? 'active' : ''}`} onClick={() => setMMode('capitalize-compound')} style={{ flex: 1 }}>Cap. Compound</button>
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                  <span className="advanced-section-title">Interest Saving Strategy</span>
                  <div className="toggle-group stack-mobile" style={{ width: '100%', marginBottom: '24px' }}>
                    <button className={`toggle-btn ${prepayFreq === 'monthly' ? 'active' : ''}`} onClick={() => setPrepayFreq('monthly')} style={{ flex: 1 }}>Monthly Extra</button>
                    <button className={`toggle-btn ${prepayFreq === 'yearly' ? 'active' : ''}`} onClick={() => setPrepayFreq('yearly')} style={{ flex: 1 }}>Yearly Lumpsum</button>
                    <button className={`toggle-btn ${prepayFreq === 'custom' ? 'active' : ''}`} onClick={() => setPrepayFreq('custom')} style={{ flex: 1 }}>Custom List</button>
                  </div>
                  
                  {prepayFreq !== 'custom' ? (
                    <SliderInput label="Extra Payment" value={prepayAmount} min={0} max={amount/2} step={500} onChange={setPrepayAmount} prefix={symbol} />
                  ) : (
                    <div>
                        {customPayments.map((payment) => (
                            <div key={payment.id} className="custom-payment-row">
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Select Month</label>
                                    <select 
                                      className="custom-input" 
                                      value={payment.month} 
                                      onChange={(e) => updateCustomPayment(payment.id, 'month', Number(e.target.value))}
                                    >
                                      {monthOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                      ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Amount ({symbol})</label>
                                    <input type="number" className="custom-input" value={payment.amount} min={0} onChange={(e) => updateCustomPayment(payment.id, 'amount', Number(e.target.value))} />
                                </div>
                                <button onClick={() => removeCustomPayment(payment.id)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', width: '40px', height: '44px', borderRadius: '10px', cursor: 'pointer', marginTop: '16px' }}>
                                    <i className="fas fa-trash" aria-hidden="true"></i>
                                </button>
                            </div>
                        ))}
                        <button onClick={addCustomPayment} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px dashed #2563eb', background: 'transparent', color: '#1d4ed8', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
                            <i className="fas fa-plus" aria-hidden="true"></i> Add Prepayment
                        </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Monthly EMI</div>
                <div className="result-amount" style={{ color: '#111827' }}>{formatCurrency(emiResult.emi, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Principal</span><span className="stat-value">{formatCurrency(amount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Total Interest</span><span className="stat-value" style={{ color: '#b45309' }}>{formatCurrency(emiResult.totalInterest, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Total Payable</span><span className="stat-value">{formatCurrency(emiResult.totalPayment, currency)}</span></div>
             </div>
             <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={65} dataKey="value" stroke="#f8fafc" strokeWidth={4} label={renderPieLabel} labelLine={false}>
                      {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="action-hub">
          <div className="action-hub-title"><i className="fas fa-file-export"></i> Professional Reports</div>
          <div className="action-btn-row">
            <button onClick={() => downloadExcel(emiResult.amortization)} className="action-btn" style={{ background: '#059669', color: 'white' }}><i className="fas fa-file-excel"></i> Excel</button>
            <button onClick={() => downloadPDF(emiResult.amortization, amount, rate, totalMonths, currency)} className="action-btn" style={{ background: '#dc2626', color: 'white' }}><i className="fas fa-file-pdf"></i> PDF</button>
            <button onClick={generateShareLink} className="action-btn" style={{ background: '#2563eb', color: 'white' }}>{shareLinkCopied ? 'Link Copied' : 'Share Tool'}</button>
          </div>
        </div>

        <div style={{ marginTop: '32px' }}>
           <AmortizationSchedule data={emiResult.amortization} currencyCode={currency} startDate={startDate} />
        </div>

        <section className="seo-section">
          <h2>Equated Monthly Installment (EMI) Explained</h2>
          <p>An <strong>EMI</strong> is the fixed amount you pay back to a lender every month. It consists of both principal and interest components.</p>
          <h3>The EMI Formula</h3>
          <div className="formula-box">E = P &times; r &times; [ (1 + r)^n / ( (1 + r)^n - 1 ) ]</div>
          <p>Where <strong>P</strong> is principal, <strong>r</strong> is monthly interest, and <strong>n</strong> is tenure in months.</p>
        </section>
    </Layout>
  );
};

export default EMICalculator;