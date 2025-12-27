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
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

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

  const isFY2526 = financialYear === 'FY 2025-26';

  const diff = result.oldRegime.tax - result.newRegime.tax;
  const isNewRegimeBetter = diff > 0;
  const savings = Math.abs(diff);

  const chartData = [
    { name: 'Old', tax: result.oldRegime.tax, color: '#64748b' },
    { name: 'New', tax: result.newRegime.tax, color: '#3b82f6' }
  ];

  const generateShareLink = () => {
    const params = new URLSearchParams();
    params.set('fy', financialYear);
    params.set('inc', income.toString());
    const newUrl = `${window.location.origin}${window.location.pathname}#/income-tax-calculator?${params.toString()}`;
    navigator.clipboard.writeText(newUrl).then(() => {
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 3000);
    });
  };

  return (
    <Layout title="Income Tax" titleHighlight="Calculator" icon="fas fa-file-invoice-dollar" iconColor="#3b82f6" currency={currency}>
        <style>{`
            .it-section-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; display: block; padding-left: 2px; }
            .it-chart-wrap { height: 240px; width: 100%; margin-top: 24px; min-height: 240px; }
            .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
            .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
            .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 12px; }
            .formula-box { background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; font-family: monospace; font-size: 16px; margin: 20px 0; overflow-x: auto; }
            
            @media (max-width: 600px) {
              .seo-section { padding: 24px 20px; }
              .it-chart-wrap { height: 200px; min-height: 200px; }
            }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <span className="it-section-title">Tax Profile</span>
            <div style={{ marginBottom: '8px' }}>
                <label style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', display: 'block' }}>Assessment Year</label>
                <div className="toggle-group" style={{ width: '100%', display: 'flex' }}>
                    <button className={`toggle-btn ${financialYear === 'FY 2024-25' ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setFinancialYear('FY 2024-25')}>FY 2024-25</button>
                    <button className={`toggle-btn ${financialYear === 'FY 2025-26' ? 'active' : ''}`} style={{ flex: 1, padding: '12px' }} onClick={() => setFinancialYear('FY 2025-26')}>FY 2025-26</button>
                </div>
            </div>
            <SliderInput label="Annual Salary" value={income} min={100000} max={10000000} step={10000} onChange={setIncome} prefix={symbol} />
            <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
               <button style={{ width: '100%', border: 'none', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '8px 0', outline: 'none' }} onClick={() => setShowDeductions(!showDeductions)}>
                 <span className="it-section-title" style={{ margin: 0 }}>Deductions (Old Regime)</span>
                 <i className={`fas fa-chevron-${showDeductions ? 'up' : 'down'}`} style={{ color: '#94a3b8', fontSize: '14px' }}></i>
               </button>
               {showDeductions && (
                 <div style={{ marginTop: '20px' }}>
                    <SliderInput label="80C (PPF, LIC)" value={ded80C} min={0} max={150000} step={1000} onChange={setDed80C} prefix={symbol} />
                    <SliderInput label="80D (Health)" value={ded80D} min={0} max={100000} step={1000} onChange={setDed80D} prefix={symbol} />
                    <SliderInput label="HRA Exemption" value={hra} min={0} max={1000000} step={5000} onChange={setHra} prefix={symbol} />
                 </div>
               )}
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Tax Payable ({isNewRegimeBetter ? 'New' : 'Old'})</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(isNewRegimeBetter ? result.newRegime.tax : result.oldRegime.tax, currency)}</div>
                {savings > 0 && <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: 800, color: '#166534', background: '#f0fdf4', padding: '10px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>SAVINGS: {formatCurrency(savings, currency)}</div>}
                
                <button onClick={generateShareLink} className="action-btn" style={{ background: '#3b82f6', color: 'white', marginTop: '24px', width: '100%' }}>
                  {shareLinkCopied ? (
                    <><i className="fas fa-check-circle"></i> Link Copied!</>
                  ) : (
                    <><i className="fas fa-share-nodes"></i> Share Tax Result</>
                  )}
                </button>
             </div>
             <div className="it-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(val: number) => formatCurrency(val, currency)} />
                    <Bar dataKey="tax" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <section className="seo-section">
          <h2>Income Tax Planning for FY 2025-26 & FY 2024-25</h2>
          <p>
            The Union Budget 2024 and 2025 have significantly pushed the <strong>New Tax Regime</strong> as the default and more beneficial option for most salaried employees. Understanding the difference between the two regimes is crucial for effective tax planning.
          </p>

          <h3>New Tax Regime vs. Old Tax Regime</h3>
          <p>
            The <strong>Old Regime</strong> allows for various deductions like Section 80C (PPF, LIC), Section 80D (Health Insurance), and HRA. However, the <strong>New Regime</strong> offers much lower tax rates and a higher rebate limit, making it better for those who don't have massive investments.
          </p>

          <h3>Key Changes in Budget 2025 (FY 2025-26)</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Standard Deduction:</strong> Increased from ₹50,000 to <strong>₹75,000</strong> for salaried individuals.</li>
            <li><strong>Tax Rebate:</strong> No tax on income up to ₹12 Lakhs (under the New Regime with rebates).</li>
            <li><strong>Slab Revision:</strong> Tax slabs have been widened to provide more relief to middle-income earners.</li>
          </ul>

          <h3>How is Income Tax Calculated?</h3>
          <p>Tax is calculated by applying the relevant slab rates to your "Net Taxable Income."</p>
          <div className="formula-box">
            Taxable Income = Gross Salary - Standard Deduction - Exemptions (80C, 80D, etc.) <br/>
            Final Tax = Base Tax (from Slabs) + 4% Health & Education Cess
          </div>
        </section>
    </Layout>
  );
};

export default IncomeTaxCalculator;