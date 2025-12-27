
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="calc-left" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Loan Offer 1</h3>
          <SliderInput label="Amount" value={loan1.amount} min={10000} max={10000000} step={10000} onChange={(v) => setLoan1({...loan1, amount: v})} prefix={formatCurrency(0, currency).replace('0', '')} />
          <SliderInput label="Interest Rate (%)" value={loan1.rate} min={1} max={25} step={0.1} onChange={(v) => setLoan1({...loan1, rate: v})} />
          <SliderInput label="Tenure (Years)" value={loan1.tenure} min={1} max={40} step={1} onChange={(v) => setLoan1({...loan1, tenure: v})} />
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>MONTHLY EMI</div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{formatCurrency(res1.emi, currency)}</div>
          </div>
        </div>

        <div className="calc-left" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Loan Offer 2</h3>
          <SliderInput label="Amount" value={loan2.amount} min={10000} max={10000000} step={10000} onChange={(v) => setLoan2({...loan2, amount: v})} prefix={formatCurrency(0, currency).replace('0', '')} />
          <SliderInput label="Interest Rate (%)" value={loan2.rate} min={1} max={25} step={0.1} onChange={(v) => setLoan2({...loan2, rate: v})} />
          <SliderInput label="Tenure (Years)" value={loan2.tenure} min={1} max={40} step={1} onChange={(v) => setLoan2({...loan2, tenure: v})} />
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>MONTHLY EMI</div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>{formatCurrency(res2.emi, currency)}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px', background: '#eff6ff', padding: '32px', borderRadius: '24px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
        <h2 style={{ fontSize: '14px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Total Savings</h2>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#1d4ed8' }}>{formatCurrency(savings, currency)}</div>
        <p style={{ marginTop: '12px', color: '#64748b', fontWeight: 600 }}>You save this much interest with <strong>{betterLoan}</strong></p>
      </div>
    </Layout>
  );
};

export default LoanComparisonCalculator;
