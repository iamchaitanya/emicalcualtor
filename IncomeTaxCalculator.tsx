import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  calculateIncomeTax,
  formatCurrency, 
  getCurrencySymbol
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const IncomeTaxCalculator: React.FC = () => {
  // Income Tax is India specific for this implementation
  const [currency] = useState<string>('INR');
  
  // Inputs
  const [financialYear, setFinancialYear] = useState<'FY 2024-25' | 'FY 2025-26'>('FY 2024-25');
  const [income, setIncome] = useState<number>(1200000);
  const [ageGroup, setAgeGroup] = useState<'<60' | '60-80' | '>80'>('<60');
  
  // Deductions
  const [ded80C, setDed80C] = useState<number>(150000);
  const [ded80D, setDed80D] = useState<number>(25000);
  const [hra, setHra] = useState<number>(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(0);
  const [nps, setNps] = useState<number>(0);
  const [other, setOther] = useState<number>(0);
  
  const [showDeductions, setShowDeductions] = useState<boolean>(true);
  const [breakdownView, setBreakdownView] = useState<'new' | 'old'>('new');

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const result = useMemo(() => {
    return calculateIncomeTax(income, ageGroup, financialYear, {
        section80C: ded80C,
        section80D: ded80D,
        hra: hra,
        homeLoanInterest: homeLoanInterest,
        nps: nps,
        other: other
    });
  }, [income, ageGroup, financialYear, ded80C, ded80D, hra, homeLoanInterest, nps, other]);

  const diff = result.oldRegime.tax - result.newRegime.tax;
  const isNewRegimeBetter = diff > 0;
  const savings = Math.abs(diff);

  // Auto-switch breakdown view to the better regime initially if not user overridden? 
  // For now let's keep it manual or simple logic
  // React.useEffect(() => {
  //     setBreakdownView(isNewRegimeBetter ? 'new' : 'old');
  // }, [isNewRegimeBetter]); 
  // Logic removed to prevent jitter while typing

  const chartData = [
    { name: 'Old Regime', tax: result.oldRegime.tax, color: '#64748b' },
    { name: 'New Regime', tax: result.newRegime.tax, color: '#3b82f6' }
  ];

  const activeBreakdown = breakdownView === 'new' ? result.newRegime : result.oldRegime;

  return (
    <Layout 
      title="Income Tax" 
      titleHighlight="Calculator" 
      icon="fas fa-file-invoice-dollar" 
      iconColor="#3b82f6"
      currency={currency}
    >
        <div className="calc-wrapper">
          <div className="calc-left">
             {/* Section 1: Income Details */}
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>
              Income Details
            </h2>
            
            <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
                   Financial Year
                </label>
                <div className="toggle-group" style={{ width: '100%', display: 'flex' }}>
                    <button 
                        className={`toggle-btn ${financialYear === 'FY 2024-25' ? 'active' : ''}`} 
                        onClick={() => setFinancialYear('FY 2024-25')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        FY 2024-25
                    </button>
                    <button 
                        className={`toggle-btn ${financialYear === 'FY 2025-26' ? 'active' : ''}`} 
                        onClick={() => setFinancialYear('FY 2025-26')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        FY 2025-26
                    </button>
                </div>
            </div>
            
            <SliderInput 
              label="Gross Annual Income" 
              value={income} 
              min={100000} 
              max={5000000} 
              step={10000} 
              onChange={setIncome} 
              prefix={symbol}
            />

            <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
                   Age Group
                </label>
                <div className="toggle-group" style={{ width: '100%', display: 'flex' }}>
                    <button 
                        className={`toggle-btn ${ageGroup === '<60' ? 'active' : ''}`} 
                        onClick={() => setAgeGroup('<60')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        &lt; 60
                    </button>
                    <button 
                        className={`toggle-btn ${ageGroup === '60-80' ? 'active' : ''}`} 
                        onClick={() => setAgeGroup('60-80')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        60 - 80
                    </button>
                    <button 
                        className={`toggle-btn ${ageGroup === '>80' ? 'active' : ''}`} 
                        onClick={() => setAgeGroup('>80')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        &gt; 80
                    </button>
                </div>
            </div>

            {/* Section 2: Deductions */}
            <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
               <div 
                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: showDeductions ? '24px' : '0' }}
                 onClick={() => setShowDeductions(!showDeductions)}
               >
                 <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Deductions (For Old Regime)
                 </h2>
                 <i className={`fas fa-chevron-${showDeductions ? 'up' : 'down'}`} style={{ color: '#94a3b8' }}></i>
               </div>

               {showDeductions && (
                 <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <SliderInput 
                        label="80C (LIC, PPF, ELSS)" 
                        value={ded80C} 
                        min={0} 
                        max={150000} 
                        step={1000} 
                        onChange={setDed80C} 
                        prefix={symbol}
                    />
                    <SliderInput 
                        label="80D (Health Insurance)" 
                        value={ded80D} 
                        min={0} 
                        max={100000} 
                        step={1000} 
                        onChange={setDed80D} 
                        prefix={symbol}
                    />
                     <SliderInput 
                        label="HRA Exemption" 
                        value={hra} 
                        min={0} 
                        max={500000} 
                        step={5000} 
                        onChange={setHra} 
                        prefix={symbol}
                    />
                     <SliderInput 
                        label="Home Loan Interest (Sec 24b)" 
                        value={homeLoanInterest} 
                        min={0} 
                        max={200000} 
                        step={5000} 
                        onChange={setHomeLoanInterest} 
                        prefix={symbol}
                    />
                     <SliderInput 
                        label="NPS (80CCD)" 
                        value={nps} 
                        min={0} 
                        max={50000} 
                        step={1000} 
                        onChange={setNps} 
                        prefix={symbol}
                    />
                 </div>
               )}
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card" style={{ borderColor: isNewRegimeBetter ? '#3b82f6' : '#64748b' }}>
                <div className="result-title">Tax Payable ({isNewRegimeBetter ? 'New' : 'Old'} Regime)</div>
                <div className="result-amount" style={{ color: isNewRegimeBetter ? '#3b82f6' : '#64748b' }}>
                    {formatCurrency(isNewRegimeBetter ? result.newRegime.tax : result.oldRegime.tax, currency)}
                </div>
                <div style={{ marginTop: '12px', padding: '8px', background: isNewRegimeBetter ? '#eff6ff' : '#f1f5f9', borderRadius: '8px', color: isNewRegimeBetter ? '#1d4ed8' : '#475569', fontSize: '13px', fontWeight: 600 }}>
                    {savings > 0 ? (
                        <>You save <span style={{ fontWeight: 800 }}>{formatCurrency(savings, currency)}</span> with {isNewRegimeBetter ? 'New' : 'Old'} Regime!</>
                    ) : (
                        <>Tax liability is same under both regimes.</>
                    )}
                </div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Old Regime Tax</span>
                  <span className="stat-value" style={{ color: '#64748b' }}>{formatCurrency(result.oldRegime.tax, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">New Regime Tax</span>
                  <span className="stat-value" style={{ color: '#3b82f6' }}>{formatCurrency(result.newRegime.tax, currency)}</span>
                </div>
             </div>

             <div style={{ width: '100%', height: '220px', marginTop: '24px' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        formatter={(val: number) => formatCurrency(val, currency)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="tax" radius={[8, 8, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
             
             <div style={{ marginTop: '24px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
                 <p style={{ margin: '0 0 8px 0' }}><strong>New Regime Highlights ({financialYear}):</strong></p>
                 <ul style={{ margin: 0, paddingLeft: '20px' }}>
                     <li style={{ marginBottom: '4px' }}>
                         {financialYear === 'FY 2025-26' 
                            ? 'Rebate increased! Taxable income up to ₹12 Lakhs is tax-free.'
                            : 'Taxable income up to ₹7 Lakhs is tax-free.'
                         }
                     </li>
                     <li>Standard Deduction is ₹75,000.</li>
                     <li>New Tax Slabs applied for {financialYear}.</li>
                 </ul>
             </div>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Tax Computation Breakdown</h3>
                <div className="toggle-group" style={{ background: '#e2e8f0' }}>
                    <button 
                        className={`toggle-btn ${breakdownView === 'new' ? 'active' : ''}`} 
                        onClick={() => setBreakdownView('new')}
                        style={{ minWidth: '100px' }}
                    >
                        New Regime
                    </button>
                    <button 
                        className={`toggle-btn ${breakdownView === 'old' ? 'active' : ''}`} 
                        onClick={() => setBreakdownView('old')}
                        style={{ minWidth: '100px' }}
                    >
                        Old Regime
                    </button>
                </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Income Slab</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tax Rate</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Taxable Amount</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tax Calculated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeBreakdown.slabs.map((slab, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>{slab.label}</td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{slab.rate}</td>
                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#334155' }}>{formatCurrency(slab.taxableAmount, currency)}</td>
                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(slab.amount, currency)}</td>
                            </tr>
                        ))}
                        
                        {/* Summary Rows */}
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Total Computed Tax</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(activeBreakdown.baseTax + activeBreakdown.rebate87A, currency)}</td>
                        </tr>

                        {activeBreakdown.rebate87A > 0 && (
                            <tr style={{ background: '#f0fdf4', borderBottom: '1px solid #f1f5f9' }}>
                                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#166534' }}>Less: Rebate u/s 87A</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#166534' }}>- {formatCurrency(activeBreakdown.rebate87A, currency)}</td>
                            </tr>
                        )}

                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Add: Health & Education Cess (4%)</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(activeBreakdown.cess, currency)}</td>
                        </tr>

                        <tr style={{ background: '#eff6ff' }}>
                            <td colSpan={3} style={{ padding: '16px', textAlign: 'right', fontSize: '15px', fontWeight: 800, color: '#1e3a8a' }}>Total Tax Payable</td>
                            <td style={{ padding: '16px', textAlign: 'right', fontSize: '18px', fontWeight: 800, color: '#1e3a8a' }}>{formatCurrency(activeBreakdown.tax, currency)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </Layout>
  );
};

export default IncomeTaxCalculator;