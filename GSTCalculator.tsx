import React, { useState, useMemo } from 'react';
import { 
  calculateGST,
  formatCurrency, 
  getCurrencySymbol, 
  detectCurrencyFromLocale 
} from './utils/calculations';
import SliderInput from './components/SliderInput';
import Layout from './components/Layout';

const GSTCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<string>(detectCurrencyFromLocale());
  const [amount, setAmount] = useState<number>(10000);
  const [rate, setRate] = useState<number>(18);
  const [type, setType] = useState<'inclusive' | 'exclusive'>('exclusive');

  const symbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const result = useMemo(() => calculateGST(amount, rate, type), [amount, rate, type]);

  return (
    <Layout title="GST" titleHighlight="Calculator" icon="fas fa-percentage" iconColor="#ef4444" currency={currency} onCurrencyChange={setCurrency}>
        <style>{`
          .seo-section { margin-top: 60px; padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; line-height: 1.7; color: #334155; }
          .seo-section h2 { color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
          .formula-box { background: #fef2f2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444; font-family: monospace; font-size: 16px; margin: 20px 0; }
        `}</style>

        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>Tax Details</h2>
            <SliderInput label="Amount" value={amount} min={100} max={1000000} step={100} onChange={setAmount} prefix={symbol} />
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>GST Rate</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[5, 12, 18, 28].map(r => (
                  <button key={r} onClick={() => setRate(r)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: rate === r ? '2px solid #ef4444' : '1px solid #e2e8f0', background: rate === r ? '#fef2f2' : 'white', fontWeight: 700, cursor: 'pointer' }}>{r}%</button>
                ))}
              </div>
            </div>
            <div className="toggle-group" style={{ width: '100%', display: 'flex' }}>
                <button className={`toggle-btn ${type === 'exclusive' ? 'active' : ''}`} onClick={() => setType('exclusive')} style={{ flex: 1, padding: '12px' }}>Exclusive (Add Tax)</button>
                <button className={`toggle-btn ${type === 'inclusive' ? 'active' : ''}`} onClick={() => setType('inclusive')} style={{ flex: 1, padding: '12px' }}>Inclusive (Remove Tax)</button>
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Total Amount</div>
                <div className="result-amount" style={{ color: '#ef4444' }}>{formatCurrency(result.totalAmount, currency)}</div>
             </div>
             <div className="stats-grid">
                <div className="stat-item"><span className="stat-label">Net Amount</span><span className="stat-value">{formatCurrency(result.netAmount, currency)}</span></div>
                <div className="stat-item"><span className="stat-label">GST Amount</span><span className="stat-value" style={{ color: '#ef4444' }}>{formatCurrency(result.gstAmount, currency)}</span></div>
             </div>
          </div>
        </div>

        <section className="seo-section">
          <h2>Understanding GST: Goods and Services Tax Calculations</h2>
          <p>
            GST is an indirect tax used in many countries around the world. It is a multi-stage, destination-based tax that is levied on every value addition. Understanding whether a price is <strong>Inclusive</strong> or <strong>Exclusive</strong> of tax is critical for both business owners and consumers.
          </p>

          <h3>GST Exclusive Formula (Add GST)</h3>
          <p>Use this when you have the base price and want to find the total cost after adding tax:</p>
          <div className="formula-box">
            GST Amount = (Price &times; GST%) / 100 <br/>
            Total Price = Price + GST Amount
          </div>

          <h3>GST Inclusive Formula (Remove GST)</h3>
          <p>Use this when you have the final price and want to find the original base price:</p>
          <div className="formula-box">
            GST Amount = Total Price - (Total Price &times; (100 / (100 + GST%))) <br/>
            Net Price = Total Price - GST Amount
          </div>
        </section>
    </Layout>
  );
};

export default GSTCalculator;