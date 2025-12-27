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
    if (searchParams.has('cp')) {
      try { setCustomPayments(JSON.parse(atob(searchParams.get('cp')!))); } catch (e) {}
    }
    if (searchParams.has('mor') || searchParams.has('pa') || searchParams.has('pf')) setShowAdvanced(true);
    if (!searchParams.has('curr')) setCurrency(detectCurrencyFromLocale());
  }, [searchParams]);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const totalMonths = useMemo(() => tenureType === 'yr' ? tenure * 12 : tenure, [tenure, tenureType]);
  
  const emiResult = useMemo(() => calculateEMI({
    principal: amount, interestRate: rate, tenure: totalMonths,
    moratoriumMonths: moratorium, moratoriumInterestMode: mMode,
    prepayment: { amount: prepayAmount, frequency: prepayFreq, customPayments }
  }), [amount, rate, totalMonths, moratorium, mMode, prepayAmount, prepayFreq, customPayments]);

  const chartData = [{ name: 'Principal', value: amount }, { name: 'Interest', value: emiResult.totalInterest }];

  const getMonthLabel = (monthIndex: number) => {
    if (!startDate) return `Month ${monthIndex}`;
    const [y, m] = startDate.split('-').map(Number);
    const d = new Date(y, (m - 1) + (monthIndex - 1));
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

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

  const addCustomPayment = () => {
    setCustomPayments([...customPayments, { id: Date.now().toString(), month: 12, amount: 0 }]);
  };

  const updateCustomPayment = (id: string, field: 'month' | 'amount', value: number) => {
    setCustomPayments(customPayments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeCustomPayment = (id: string) => {
    setCustomPayments(customPayments.filter(p => p.id !== id));
  };

  const generateShareLink = () => {
    const params = new URLSearchParams();
    params.set('amt', amount.toString());
    params.set('rate', rate.toString());
    params.set('ten', tenure.toString());
    params.set('curr', currency);
    params.set('sd', startDate);
    if (moratorium > 0) {
        params.set('mor', moratorium.toString());
        params.set('mm', mMode);
    }
    if (prepayAmount > 0) {
        params.set('pa', prepayAmount.toString());
        params.set('pf', prepayFreq);
    }
    const newUrl = `${window.location.origin}${window.location.pathname}#/emi-calculator?${params.toString()}`;
    navigator.clipboard.writeText(newUrl).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 3000);
    });
  };

  return (
    <Layout title="EMI Calculator" icon="fas fa-calculator" iconColor="#3b82f6" currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .chart-container { height: 200px; width: 100%; position: relative; min-height: 200px; min-width: 0; }
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
          .formula-box { background: #f8fafc; padding: 24px; border-radius: 12px; border-left: 4px solid #3b82f6; font-family: 'Inter', monospace; font-size: 18px; font-weight: 700; margin: 24px 0; overflow-x: auto; color: #1e293b; text-align: center; letter-spacing: 0.05em; }
          
          .action-hub {
            margin-top: 32px;
            padding: 32px;
            background: #fcfdfe;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
          }
          .action-hub-title {
            font-size: 11px;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .action-btn-row {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .advanced-toggle-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #eff6ff;
            color: #2563eb;
            border: 1px dashed #3b82f6;
            padding: 16px 24px;
            border-radius: 16px;
            font-weight: 800;
            cursor: pointer;
            margin-top: 32px;
            width: 100%;
            justify-content: center;
            transition: all 0.2s;
            font-size: 14px;
          }
          .advanced-toggle-btn:hover { background: #dbeafe; transform: scale(1.01); }
          .advanced-panel {
            margin-top: 24px;
            padding: 32px;
            background: #f8fafc;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          }
          .advanced-section-title {
            font-size: 12px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 20px;
            display: block;
          }
          .custom-payment-row {
            display: grid;
            grid-template-columns: 140px 1fr 40px;
            gap: 12px;
            align-items: center;
            margin-bottom: 12px;
          }
          .custom-input {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            color: #1e293b;
            outline: none;
            width: 100%;
            background: white;
            height: 44px;
          }
          .custom-input:focus { border-color: #3b82f6; }
          select.custom-input { cursor: pointer; }

          @media (max-width: 600px) {
            .stack-mobile { flex-direction: column !important; gap: 4px; }
            .stack-mobile .toggle-btn { width: 100%; flex: none !important; padding: 12px 14px; }
            .custom-payment-row { grid-template-columns: 1fr 1fr; gap: 8px; }
            .custom-payment-row button { grid-column: span 2; width: 100% !important; }
            .seo-section { padding: 24px 20px; }
            .formula-box { font-size: 14px; padding: 16px; }
          }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>Loan Details</h2>
            <SliderInput label="Loan Amount" value={amount} min={1000} max={10000000} step={1000} onChange={setAmount} prefix={symbol} />
            <SliderInput label="Interest Rate" value={rate} min={0.1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Tenure" value={tenure} min={1} max={tenureType === 'yr' ? 40 : 480} step={1} onChange={setTenure} 
              suffix={<div className="toggle-group"><button className={`toggle-btn ${tenureType === 'yr' ? 'active' : ''}`} onClick={() => setTenureType('yr')}>Yr</button><button className={`toggle-btn ${tenureType === 'mo' ? 'active' : ''}`} onClick={() => setTenureType('mo')}>Mo</button></div>} />
            
            <button className="advanced-toggle-btn" onClick={() => setShowAdvanced(!showAdvanced)}>
              <i className={`fas fa-${showAdvanced ? 'chevron-up' : 'cog'}`}></i>
              {showAdvanced ? 'Hide Advanced Options' : 'Personalize Moratorium & Prepayments'}
            </button>

            {showAdvanced && (
              <div className="advanced-panel">
                <div style={{ marginBottom: '32px' }}>
                  <span className="advanced-section-title">Timeline & Moratorium</span>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Loan Start Date</label>
                    <input 
                      type="month" 
                      className="custom-input" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <SliderInput label="Holiday Duration (Months)" value={moratorium} min={0} max={36} step={1} onChange={setMoratorium} />
                  {moratorium > 0 && (
                    <div style={{ marginTop: '16px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'block' }}>Interest Handling During Holiday</label>
                        <div className="toggle-group stack-mobile" style={{ width: '100%', display: 'flex' }}>
                          <button className={`toggle-btn ${mMode === 'pay' ? 'active' : ''}`} onClick={() => setMMode('pay')} style={{ flex: 1 }}>Pay Monthly</button>
                          <button className={`toggle-btn ${mMode === 'capitalize-simple' ? 'active' : ''}`} onClick={() => setMMode('capitalize-simple')} style={{ flex: 1 }}>Simple Cap.</button>
                          <button className={`toggle-btn ${mMode === 'capitalize-compound' ? 'active' : ''}`} onClick={() => setMMode('capitalize-compound')} style={{ flex: 1 }}>Compound Cap.</button>
                        </div>
                    </div>
                  )}
                </div>
                
                <div style={{ paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                  <span className="advanced-section-title">Prepayment Strategy</span>
                  <div className="toggle-group stack-mobile" style={{ width: '100%', marginBottom: '24px', display: 'flex' }}>
                    <button className={`toggle-btn ${prepayFreq === 'monthly' ? 'active' : ''}`} onClick={() => setPrepayFreq('monthly')} style={{ flex: 1 }}>Monthly Extra</button>
                    <button className={`toggle-btn ${prepayFreq === 'yearly' ? 'active' : ''}`} onClick={() => setPrepayFreq('yearly')} style={{ flex: 1 }}>Yearly Lumpsum</button>
                    <button className={`toggle-btn ${prepayFreq === 'custom' ? 'active' : ''}`} onClick={() => setPrepayFreq('custom')} style={{ flex: 1 }}>Custom List</button>
                  </div>

                  {prepayFreq === 'custom' ? (
                    <div>
                        {customPayments.map((p) => (
                            <div key={p.id} className="custom-payment-row">
                                <select 
                                  className="custom-input" 
                                  value={p.month} 
                                  onChange={(e) => updateCustomPayment(p.id, 'month', Number(e.target.value))}
                                  aria-label="Select month"
                                >
                                  {Array.from({ length: totalMonths }, (_, idx) => idx + 1).map(m => (
                                    <option key={m} value={m}>{getMonthLabel(m)}</option>
                                  ))}
                                </select>
                                <input 
                                  type="number" 
                                  className="custom-input" 
                                  placeholder="Amount" 
                                  value={p.amount || ''} 
                                  onChange={(e) => updateCustomPayment(p.id, 'amount', Number(e.target.value))} 
                                  aria-label="Prepayment amount"
                                />
                                <button onClick={() => removeCustomPayment(p.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', height: '44px', cursor: 'pointer' }}><i className="fas fa-trash-alt"></i></button>
                            </div>
                        ))}
                        <button onClick={addCustomPayment} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '12px', borderRadius: '12px', width: '100%', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}><i className="fas fa-plus"></i> Add Payment Schedule</button>
                    </div>
                  ) : (
                    <SliderInput 
                        label={prepayFreq === 'monthly' ? "Additional Monthly Payment" : "Annual Lumpsum Payment"} 
                        value={prepayAmount} min={0} max={amount/2} step={500} onChange={setPrepayAmount} prefix={symbol} 
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Monthly Payment (EMI)</div>
                <div className="result-amount">{formatCurrency(emiResult.emi, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Principal</span><span className="stat-value">{formatCurrency(amount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Total Interest</span><span className="stat-value" style={{ color: '#f59e0b' }}>{formatCurrency(emiResult.totalInterest, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">Total Amount</span><span className="stat-value">{formatCurrency(emiResult.totalPayment, currency)}</span></div>
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
          <div className="action-hub-title">
            <i className="fas fa-file-export"></i> Reports & Professional Exports
          </div>
          <div className="action-btn-row">
            <button onClick={() => downloadExcel(emiResult.amortization)} className="action-btn" style={{ background: '#10b981', color: 'white' }}>
              <i className="fas fa-file-excel"></i> Excel Report
            </button>
            <button onClick={() => downloadPDF(emiResult.amortization, amount, rate, totalMonths, currency)} className="action-btn" style={{ background: '#ef4444', color: 'white' }}>
              <i className="fas fa-file-pdf"></i> PDF Statement
            </button>
            <button onClick={generateShareLink} className="action-btn" style={{ background: '#3b82f6', color: 'white' }}>
              {shareLinkCopied ? (
                <><i className="fas fa-check-circle"></i> Link Copied</>
              ) : (
                <><i className="fas fa-share-nodes"></i> Share Tool</>
              )}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '32px' }}>
           <AmortizationSchedule data={emiResult.amortization} currencyCode={currency} startDate={startDate} />
        </div>

        <section className="seo-section">
          <h2>Equated Monthly Installment (EMI) Explained</h2>
          <p>
            An <strong>EMI</strong> is the fixed amount you pay back to a lender every month until your loan is fully paid off. It consists of both principal and interest components.
          </p>
          
          <h3>The EMI Mathematical Formula</h3>
          <p>This calculator uses the standard mathematical formula for reducing balance amortization:</p>
          <div className="formula-box">
            E = P &times; r &times; [ (1 + r)^n / ( (1 + r)^n - 1 ) ]
          </div>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>E:</strong> Equated Monthly Installment (EMI)</li>
            <li><strong>P:</strong> Principal Loan Amount (The initial sum borrowed)</li>
            <li><strong>r:</strong> Monthly Interest Rate (Annual Rate &divide; 12 &divide; 100)</li>
            <li><strong>n:</strong> Loan Tenure (Total number of monthly installments)</li>
          </ul>

          <h3>How Moratorium Affects Your Loan</h3>
          <p>
            A moratorium is a temporary suspension of payments. However, interest usually continues to accrue. Using <strong>Capitalize Compound</strong> mode means your interest earns interest, which can significantly increase your total loan cost.
          </p>
          
          <h3>Importance of Prepayments</h3>
          <p>Making extra payments directly reduces your <strong>Principal Outstanding</strong>. Since interest is calculated on the remaining balance, prepayments lead to massive savings on total interest and help you close the loan much faster than the original tenure.</p>
        </section>
    </Layout>
  );
};

export default EMICalculator;