import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  calculateIncomeTax,
  formatCurrency, 
  getCurrencySymbol
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const IncomeTaxCalculator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currency] = useState<string>('INR');
  
  const [financialYear, setFinancialYear] = useState<'FY 2024-25' | 'FY 2025-26'>('FY 2024-25');
  const [income, setIncome] = useState<number>(1200000);
  const [ageGroup, setAgeGroup] = useState<'<60' | '60-80' | '>80'>('<60');
  
  const [ded80C, setDed80C] = useState<number>(150000);
  const [ded80D, setDed80D] = useState<number>(25000);
  const [hra, setHra] = useState<number>(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(0);
  const [nps, setNps] = useState<number>(0);
  
  const [showDeductions, setShowDeductions] = useState<boolean>(true);
  const [breakdownView, setBreakdownView] = useState<'new' | 'old'>('new');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Sync state from URL
  useEffect(() => {
    if (searchParams.has('fy')) setFinancialYear(searchParams.get('fy') as any);
    if (searchParams.has('inc')) setIncome(Number(searchParams.get('inc')));
    if (searchParams.has('age')) setAgeGroup(searchParams.get('age') as any);
    if (searchParams.has('80c')) setDed80C(Number(searchParams.get('80c')));
    if (searchParams.has('80d')) setDed80D(Number(searchParams.get('80d')));
    if (searchParams.has('hra')) setHra(Number(searchParams.get('hra')));
    if (searchParams.has('hli')) setHomeLoanInterest(Number(searchParams.get('hli')));
    if (searchParams.has('nps')) setNps(Number(searchParams.get('nps')));
  }, [searchParams]);

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    return calculateIncomeTax(income, ageGroup, financialYear, {
        section80C: ded80C,
        section80D: ded80D,
        hra: hra,
        homeLoanInterest: homeLoanInterest,
        nps: nps,
        other: 0
    });
  }, [income, ageGroup, financialYear, ded80C, ded80D, hra, homeLoanInterest, nps]);

  const diff = result.oldRegime.tax - result.newRegime.tax;
  const isNewRegimeBetter = diff > 0;
  const savings = Math.abs(diff);

  const chartData = [
    { name: 'Old', tax: result.oldRegime.tax, color: '#64748b' },
    { name: 'New', tax: result.newRegime.tax, color: '#3b82f6' }
  ];

  const activeBreakdown = breakdownView === 'new' ? result.newRegime : result.oldRegime;

  const generateShareLink = () => {
    const params = new URLSearchParams();
    params.set('fy', financialYear);
    params.set('inc', income.toString());
    params.set('age', ageGroup);
    params.set('80c', ded80C.toString());
    params.set('80d', ded80D.toString());
    params.set('hra', hra.toString());
    params.set('hli', homeLoanInterest.toString());
    params.set('nps', nps.toString());

    const newUrl = `${window.location.origin}${window.location.pathname}#/income-tax-calculator?${params.toString()}`;
    navigator.clipboard.writeText(newUrl).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 3000);
    });
  };

  return (
    <Layout 
      title="Income Tax" 
      titleHighlight="Calculator" 
      icon="fas fa-file-invoice-dollar" 
      iconColor="#3b82f6"
      currency={currency}
    >
        <style>{`
            .it-section-title { 
                font-size: 11px; font-weight: 800; color: #94a3b8; 
                text-transform: uppercase; letter-spacing: 0.1em; 
                margin-bottom: 20px; display: block;
                padding-left: 2px;
            }
            .it-label { 
                font-size: 14px; font-weight: 700; color: #1e293b; 
                display: block; margin-bottom: 8px; 
            }
            .it-chart-wrap { height: 240px; width: 100%; margin-top: 24px; }
            
            .it-toggle-group {
              display: flex;
              flex-wrap: wrap; 
              background: #f1f5f9;
              padding: 4px;
              border-radius: 12px;
              width: 100%;
              gap: 4px;
              box-sizing: border-box;
              margin-bottom: 24px;
            }
            .it-toggle-item {
              flex: 1 1 auto; 
              padding: 10px 8px;
              border: none;
              background: transparent;
              cursor: pointer;
              font-size: 13px;
              font-weight: 700;
              border-radius: 8px;
              color: #64748b;
              transition: all 0.2s;
              text-align: center;
              min-width: 0;
            }
            .it-toggle-item.active {
              background: white;
              color: #3b82f6;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }

            .it-result-amount {
                font-size: 28px;
                font-weight: 800;
                color: #3b82f6;
                word-break: break-word;
                line-height: 1.1;
            }

            .it-table-container {
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                border-radius: 16px;
                border: 1px solid #e2e8f0;
                background: white;
            }

            .it-table {
                width: 100%;
                border-collapse: collapse;
                min-width: 320px; 
            }

            .it-th {
                padding: 12px 10px;
                text-align: left;
                font-size: 10px;
                font-weight: 700;
                color: #94a3b8;
                text-transform: uppercase;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
            }

            .it-td {
                padding: 12px 10px;
                font-size: 13px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
            }

            .it-share-btn {
                margin-top: 20px;
                width: 100%;
                padding: 12px;
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                color: #475569;
                font-weight: 700;
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px dashed #e2e8f0;
                font-size: 13px;
            }
            .summary-row:last-child { border-bottom: none; font-weight: 800; color: #1e293b; font-size: 14px; }

            @media (max-width: 600px) {
                .it-toggle-item { font-size: 12px; padding: 10px 4px; }
                .it-chart-wrap { height: 180px; }
                .it-result-amount { font-size: 22px; }
                .it-th, .it-td { padding: 10px 6px; font-size: 12px; }
                .it-th:first-child, .it-td:first-child { padding-left: 10px; }
                .it-th:last-child, .it-td:last-child { padding-right: 10px; }
            }
        `}</style>

        <div className="calc-wrapper">
          {/* Inputs Section */}
          <div className="calc-left">
            <span className="it-section-title">Tax Profile</span>
            
            <div style={{ marginBottom: '8px' }}>
                <label className="it-label">Assessment Year</label>
                <div className="it-toggle-group">
                    <button 
                        className={`it-toggle-item ${financialYear === 'FY 2024-25' ? 'active' : ''}`}
                        onClick={() => setFinancialYear('FY 2024-25')}
                    >
                        FY 2024-25
                    </button>
                    <button 
                        className={`it-toggle-item ${financialYear === 'FY 2025-26' ? 'active' : ''}`}
                        onClick={() => setFinancialYear('FY 2025-26')}
                    >
                        FY 2025-26
                    </button>
                </div>
            </div>
            
            <SliderInput 
              label="Annual Salary" 
              value={income} 
              min={100000} 
              max={10000000} 
              step={10000} 
              onChange={setIncome} 
              prefix={symbol}
            />

            <div style={{ marginBottom: '8px' }}>
                <label className="it-label">Age Category</label>
                <div className="it-toggle-group">
                    <button 
                        className={`it-toggle-item ${ageGroup === '<60' ? 'active' : ''}`}
                        onClick={() => setAgeGroup('<60')}
                    >
                        &lt; 60
                    </button>
                    <button 
                        className={`it-toggle-item ${ageGroup === '60-80' ? 'active' : ''}`}
                        onClick={() => setAgeGroup('60-80')}
                    >
                        60-80
                    </button>
                    <button 
                        className={`it-toggle-item ${ageGroup === '>80' ? 'active' : ''}`}
                        onClick={() => setAgeGroup('>80')}
                    >
                        &gt; 80
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
               <button 
                 style={{ 
                   width: '100%', border: 'none', background: 'transparent', 
                   display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                   cursor: 'pointer', padding: '8px 0', outline: 'none' 
                 }}
                 onClick={() => setShowDeductions(!showDeductions)}
               >
                 <span className="it-section-title" style={{ margin: 0 }}>Deductions (Old Regime)</span>
                 <i className={`fas fa-chevron-${showDeductions ? 'up' : 'down'}`} style={{ color: '#94a3b8', fontSize: '14px' }}></i>
               </button>

               {showDeductions && (
                 <div style={{ marginTop: '20px' }}>
                    <SliderInput label="80C (LIC, PPF)" value={ded80C} min={0} max={150000} step={1000} onChange={setDed80C} prefix={symbol} />
                    <SliderInput label="80D (Health)" value={ded80D} min={0} max={100000} step={1000} onChange={setDed80D} prefix={symbol} />
                    <SliderInput label="HRA Exemption" value={hra} min={0} max={1000000} step={5000} onChange={setHra} prefix={symbol} />
                    <SliderInput label="Home Loan Int" value={homeLoanInterest} min={0} max={200000} step={5000} onChange={setHomeLoanInterest} prefix={symbol} />
                    <SliderInput label="NPS (80CCD)" value={nps} min={0} max={50000} step={1000} onChange={setNps} prefix={symbol} />
                 </div>
               )}
            </div>
          </div>

          {/* Results Section */}
          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">
                    Tax Payable ({isNewRegimeBetter ? 'New' : 'Old'})
                </div>
                <div className="it-result-amount" style={{ color: isNewRegimeBetter ? '#3b82f6' : '#64748b' }}>
                    {formatCurrency(isNewRegimeBetter ? result.newRegime.tax : result.oldRegime.tax, currency)}
                </div>
                {savings > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 800, color: '#166534', background: '#f0fdf4', padding: '10px 8px', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <i className="fas fa-check-circle"></i> NEW REGIME SAVES {formatCurrency(savings, currency)}
                  </div>
                )}
                
                <button onClick={generateShareLink} className="it-share-btn">
                    {shareLinkCopied ? <><i className="fas fa-check"></i> Copied!</> : <><i className="fas fa-share-alt"></i> Share Calculation</>}
                </button>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Old Tax</span>
                  <span className="stat-value">{formatCurrency(result.oldRegime.tax, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">New Tax</span>
                  <span className="stat-value" style={{ color: '#3b82f6' }}>{formatCurrency(result.newRegime.tax, currency)}</span>
                </div>
             </div>

             <div className="it-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} dy={10} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(val: number) => formatCurrency(val, currency)} />
                    <Bar dataKey="tax" radius={[6, 6, 0, 0]} barSize={32}>
                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Calculation Breakdown */}
        <div style={{ marginTop: '48px', width: '100%', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '24px', paddingLeft: '2px' }}>Detailed Breakdown</h3>
            
            <div className="it-toggle-group" style={{ maxWidth: '280px', marginBottom: '24px' }}>
                <button className={`it-toggle-item ${breakdownView === 'new' ? 'active' : ''}`} onClick={() => setBreakdownView('new')}>New Regime</button>
                <button className={`it-toggle-item ${breakdownView === 'old' ? 'active' : ''}`} onClick={() => setBreakdownView('old')}>Old Regime</button>
            </div>

            {/* Income Summary Card */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div className="summary-row">
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Gross Total Income</span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(income, currency)}</span>
                </div>
                <div className="summary-row">
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Total Deductions & Exemptions</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>- {formatCurrency(breakdownView === 'new' ? 75000 : result.oldRegime.totalDeductions || 0, currency)}</span>
                </div>
                <div className="summary-row">
                    <span>Net Taxable Income</span>
                    <span style={{ color: '#3b82f6' }}>{formatCurrency(activeBreakdown.taxableIncome, currency)}</span>
                </div>
            </div>

            <span className="it-section-title">Tax Computation Slabs</span>
            <div className="it-table-container">
                <table className="it-table">
                    <thead>
                        <tr>
                            <th className="it-th">Income Slab</th>
                            <th className="it-th" style={{ textAlign: 'center' }}>Rate</th>
                            <th className="it-th" style={{ textAlign: 'right' }}>Tax Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeBreakdown.slabs.map((slab, idx) => (
                            <tr key={idx}>
                                <td className="it-td" style={{ fontWeight: 600 }}>{slab.label}</td>
                                <td className="it-td" style={{ textAlign: 'center', color: '#64748b' }}>{slab.rate}</td>
                                <td className="it-td" style={{ textAlign: 'right', fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(slab.amount, currency)}</td>
                            </tr>
                        ))}
                        {activeBreakdown.rebate87A > 0 && (
                            <tr>
                                <td className="it-td" style={{ fontWeight: 600 }}>Rebate u/s 87A</td>
                                <td className="it-td" style={{ textAlign: 'center' }}>-</td>
                                <td className="it-td" style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>-{formatCurrency(activeBreakdown.rebate87A, currency)}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="it-td" style={{ fontWeight: 600 }}>Education Cess (4%)</td>
                            <td className="it-td" style={{ textAlign: 'center' }}>-</td>
                            <td className="it-td" style={{ textAlign: 'right', fontWeight: 700, color: '#334155' }}>{formatCurrency(activeBreakdown.cess, currency)}</td>
                        </tr>
                        <tr style={{ background: '#eff6ff' }}>
                            <td colSpan={2} className="it-td" style={{ textAlign: 'right', fontSize: '13px', fontWeight: 800, color: '#1e3a8a', borderBottom: 'none' }}>Final Tax Liability</td>
                            <td className="it-td" style={{ textAlign: 'right', fontSize: '16px', fontWeight: 800, color: '#1e3a8a', borderBottom: 'none' }}>{formatCurrency(activeBreakdown.tax, currency)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </Layout>
  );
};

export default IncomeTaxCalculator;