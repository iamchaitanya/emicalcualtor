import React, { useState, useMemo } from 'react';
import { calculateEMI, formatCurrency } from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const LoanComparisonCalculator: React.FC = () => {
  const [currency, setCurrency] = useState('USD');
  const [loan1, setLoan1] = useState({ amount: 500000, rate: 9.5, tenure: 20 });
  const [loan2, setLoan2] = useState({ amount: 500000, rate: 8.5, tenure: 20 });

  const res1 = useMemo(() => calculateEMI({ principal: loan1.amount, interestRate: loan1.rate, tenure: loan1.tenure * 12 }), [loan1]);
  const res2 = useMemo(() => calculateEMI({ principal: loan2.amount, interestRate: loan2.rate, tenure: loan2.tenure * 12 }), [loan2]);

  const savings = Math.abs(res1.totalInterest - res2.totalInterest);
  const betterLoan = res1.totalInterest < res2.totalInterest ? "Loan 1" : "Loan 2";

  return (
    <Layout title="Loan" titleHighlight="Comparison" icon="fas fa-columns" iconColor="#3b82f6" currency={currency} onCurrencyChange={setCurrency}>
      <style>{`
        .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
        .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
        .seo-section h3 { color: #1e293b; font-size: 18px; font-weight: 700; margin-top: 32px; margin-bottom: 12px; }
        .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .comparison-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="comparison-grid">
        <div className="calc-left" style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.05em' }}>Loan Option A</h3>
          <SliderInput label="Principal Amount" value={loan1.amount} min={10000} max={10000000} step={10000} onChange={(v) => setLoan1({...loan1, amount: v})} prefix={currency === 'INR' ? '₹' : '$'} />
          <SliderInput label="Interest Rate (%)" value={loan1.rate} min={1} max={25} step={0.1} onChange={(v) => setLoan1({...loan1, rate: v})} />
          <SliderInput label="Tenure (Years)" value={loan1.tenure} min={1} max={40} step={1} onChange={(v) => setLoan1({...loan1, tenure: v})} />
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>MONTHLY EMI</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(res1.emi, currency)}</div>
          </div>
        </div>

        <div className="calc-left" style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.05em' }}>Loan Option B</h3>
          <SliderInput label="Principal Amount" value={loan2.amount} min={10000} max={10000000} step={10000} onChange={(v) => setLoan2({...loan2, amount: v})} prefix={currency === 'INR' ? '₹' : '$'} />
          <SliderInput label="Interest Rate (%)" value={loan2.rate} min={1} max={25} step={0.1} onChange={(v) => setLoan2({...loan2, rate: v})} />
          <SliderInput label="Tenure (Years)" value={loan2.tenure} min={1} max={40} step={1} onChange={(v) => setLoan2({...loan2, tenure: v})} />
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>MONTHLY EMI</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{formatCurrency(res2.emi, currency)}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px', background: '#eff6ff', padding: '40px', borderRadius: '32px', textAlign: 'center', border: '1px solid #bfdbfe', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1)' }}>
        <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Total Interest Savings</h2>
        <div style={{ fontSize: '42px', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.02em' }}>{formatCurrency(savings, currency)}</div>
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600, fontSize: '15px' }}>Choosing <strong>{betterLoan}</strong> will save you significant interest over the loan life.</p>
      </div>

      <section className="seo-section">
        <h2>How to Compare Loan Offers Like a Professional</h2>
        <p>When shopping for a loan—whether for a home, car, or business—the lowest interest rate doesn't always mean the best deal. A <strong>Loan Comparison</strong> requires looking at the "Total Cost of Borrowing."</p>

        <h3>1. The Interest Rate vs. Processing Fees</h3>
        <p>Bank A might offer 8.5% with a 1% processing fee, while Bank B offers 8.7% with zero processing fees. For short-term loans, the higher rate with no fees is often cheaper. For long-term home loans, the lower rate is almost always better despite the upfront fees.</p>

        <h3>2. Fixed vs. Floating Rates</h3>
        <p><strong>Fixed Rates</strong> offer peace of mind as your EMI never changes. <strong>Floating Rates</strong> are linked to market benchmarks; your EMI will drop when interest rates fall but will spike when rates rise. Most experts suggest floating rates for long tenures to benefit from market cycles.</p>

        <h3>3. Impact of Tenure on Total Interest</h3>
        <p>A longer tenure (e.g., 30 years) makes your monthly EMI affordable, but it leads to a massive interest outgo. A shorter tenure (e.g., 15 years) might pinch your monthly budget but could save you more than 50% in total interest costs.</p>

        <h3>4. Prepayment Clauses</h3>
        <p>Check if your lender allows "Penalty-Free Prepayments." Being able to pay an extra 5-10% toward your principal every year can reduce a 20-year loan to 12 years, saving you a fortune.</p>
      </section>
    </Layout>
  );
};

export default LoanComparisonCalculator;