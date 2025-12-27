
import React, { useState, useMemo } from 'react';
import { calculateLoanEligibility, formatCurrency } from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const LoanEligibilityCalculator: React.FC = () => {
  const [currency, setCurrency] = useState('USD');
  const [income, setIncome] = useState(50000);
  const [existingEMI, setExistingEMI] = useState(0);
  const [rate, setRate] = useState(9.5);
  const [tenure, setTenure] = useState(20);
  const [foir, setFoir] = useState(50);

  const maxLoan = useMemo(() => calculateLoanEligibility(income, existingEMI, rate, tenure, foir), [income, existingEMI, rate, tenure, foir]);

  return (
    <Layout title="Loan" titleHighlight="Eligibility" icon="fas fa-user-check" iconColor="#3b82f6" currency={currency} onCurrencyChange={setCurrency}>
      <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .formula-box { background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; font-family: monospace; font-size: 16px; margin: 20px 0; }
          @media (max-width: 600px) { .seo-section { padding: 24px 20px; } }
      `}</style>

      <div className="calc-wrapper">
        <div className="calc-left">
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '32px' }}>Check Your Eligibility</h2>
          <SliderInput label="Monthly Income" value={income} min={5000} max={1000000} step={5000} onChange={setIncome} prefix="$" />
          <SliderInput label="Existing EMIs" value={existingEMI} min={0} max={income} step={1000} onChange={setExistingEMI} prefix="$" />
          <SliderInput label="FOIR Ratio (%)" value={foir} min={10} max={100} step={1} onChange={setFoir} suffix="%" />
          <SliderInput label="Tenure (Y)" value={tenure} min={1} max={30} step={1} onChange={setTenure} suffix="Y" />
        </div>

        <div className="calc-right">
          <div className="result-card">
            <div className="result-title">Max Loan Amount</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>{formatCurrency(maxLoan, currency)}</div>
          </div>
          <div className="stats-grid">
            <div className="stat-item"><span className="stat-label">Disposable Income</span><span className="stat-value">{formatCurrency((income * (foir / 100)) - existingEMI, currency)}</span></div>
          </div>
          <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px', fontSize: '13px', color: '#64748b' }}>
            Banks usually cap your debt-to-income at 50% (FOIR). This means your total EMIs shouldn't exceed half of your income.
          </div>
        </div>
      </div>

      <section className="seo-section">
        <h2>How to Increase Your Loan Eligibility?</h2>
        <p>
          Before approving a loan, banks assess your repayment capacity. The most common metric used is the <strong>Fixed Obligation to Income Ratio (FOIR)</strong>.
        </p>

        <h3>What is FOIR?</h3>
        <p>
          FOIR is the percentage of your monthly income used to pay off existing debts (EMIs, credit card bills, etc.). A ratio below 50% is considered healthy by most lenders.
        </p>
        <div className="formula-box">
          Disposable Income = (Monthly Income &times; FOIR%) - Existing EMIs <br/>
          Loan Eligibility = Present Value of Disposable Income over Tenure
        </div>

        <h3>Key Factors Banks Consider:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Credit Score (CIBIL):</strong> A score above 750 ensures faster approval and lower interest rates.</li>
          <li><strong>Age:</strong> Younger applicants often get longer tenures, increasing their eligible loan amount.</li>
          <li><strong>Employment Stability:</strong> Steady income from a reputable employer reduces the lender's risk.</li>
        </ul>
      </section>
    </Layout>
  );
};

export default LoanEligibilityCalculator;
