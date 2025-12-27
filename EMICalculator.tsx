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
    if (searchParams.has('mor') || searchParams.has('pa') || searchParams.has('pf') || searchParams.has('cp')) setShowAdvanced(true);
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

  const generateShareLink = () => {
    const params = new URLSearchParams();
    params.set('amt', amount.toString());
    params.set('rate', rate.toString());
    params.set('ten', tenure.toString());
    params.set('curr', currency);
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
          .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 12px; }
          .formula-box { background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; font-family: monospace; font-size: 16px; margin: 20px 0; overflow-x: auto; }
          .faq-item { margin-bottom: 24px; }
          .faq-q { font-weight: 700; color: #1e293b; display: block; margin-bottom: 4px; font-size: 15px; }
          
          .action-hub {
            margin-top: 32px;
            padding: 32px;
            background: #f8fafc;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
          }
          .action-hub-title {
            font-size: 12px;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .action-btn-row {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>Loan Details</h2>
            <SliderInput label="Loan Amount" value={amount} min={1000} max={10000000} step={1000} onChange={setAmount} prefix={symbol} />
            <SliderInput label="Interest Rate" value={rate} min={0.1} max={30} step={0.1} onChange={setRate} suffix="%" />
            <SliderInput label="Tenure" value={tenure} min={1} max={tenureType === 'yr' ? 40 : 480} step={1} onChange={setTenure} 
              suffix={<div className="toggle-group"><button className={`toggle-btn ${tenureType === 'yr' ? 'active' : ''}`} onClick={() => setTenureType('yr')}>Yr</button><button className={`toggle-btn ${tenureType === 'mo' ? 'active' : ''}`} onClick={() => setTenureType('mo')}>Mo</button></div>} />
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
            <i className="fas fa-file-export"></i> Reports & Sharing
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

        <div style={{ marginTop: '24px' }}>
           <AmortizationSchedule data={emiResult.amortization} currencyCode={currency} startDate={startDate} />
        </div>

        {/* SEO SECTION */}
        <section className="seo-section">
          <h2>Everything You Need to Know About EMI Calculations</h2>
          <p>
            An <strong>Equated Monthly Installment (EMI)</strong> is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are applied to both interest and principal each month, so that over a specified number of years, the loan is paid off in full.
          </p>

          <h3>The EMI Calculation Formula</h3>
          <p>Our Smart EMI Pro calculator uses the standard reducing balance formula to ensure 100% accuracy with bank standards:</p>
          <div className="formula-box">
            E = P &times; r &times; (1 + r)^n / ((1 + r)^n - 1)
          </div>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>E</strong> is the EMI amount.</li>
            <li><strong>P</strong> is the Principal Loan Amount.</li>
            <li><strong>r</strong> is the monthly interest rate (Annual Rate / 12 / 100).</li>
            <li><strong>n</strong> is the loan tenure in months.</li>
          </ul>

          <h3>How to Use the EMI Calculator?</h3>
          <p>
            Using our tool is simple. Just slide the bars to adjust your Loan Amount, Interest Rate, and Tenure. The chart will update in real-time to show you the ratio between your principal and interest. 
            For advanced users, we offer <strong>Moratorium</strong> options (holiday periods) and <strong>Prepayment</strong> tracking to see how much interest you can save by paying early.
          </p>

          <h3>Frequently Asked Questions (FAQ)</h3>
          <div className="faq-item">
            <span className="faq-q">What is the difference between flat rate and reducing balance?</span>
            <p>A flat rate calculates interest on the full principal throughout the tenure. A reducing balance rate (which this calculator uses) only calculates interest on the remaining principal, saving you money as you pay off the loan.</p>
          </div>
          <div className="faq-item">
            <span className="faq-q">Can prepayments help reduce my EMI?</span>
            <p>Prepayments typically reduce your loan tenure rather than your monthly EMI. However, by reducing the tenure, you significantly decrease the total interest payable over the life of the loan.</p>
          </div>
          <div className="faq-item">
            <span className="faq-q">Is the EMI amount inclusive of processing fees?</span>
            <p>No, standard EMI calculations only cover principal and interest. Processing fees or insurance costs are usually one-time upfront payments.</p>
          </div>
        </section>
    </Layout>
  );
};

export default EMICalculator;