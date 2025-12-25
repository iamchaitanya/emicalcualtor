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

  const result = useMemo(() => {
    return calculateGST(amount, rate, type);
  }, [amount, rate, type]);

  return (
    <Layout 
      title="GST" 
      titleHighlight="Calculator" 
      icon="fas fa-percentage" 
      iconColor="#ef4444"
      currency={currency}
      onCurrencyChange={setCurrency}
    >
        <div className="calc-wrapper">
          <div className="calc-left">
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '32px' }}>
              Tax Details
            </h2>
            
            <SliderInput 
              label="Amount" 
              value={amount} 
              min={100} 
              max={1000000} 
              step={100} 
              onChange={setAmount} 
              prefix={symbol}
            />

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
                GST Rate
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[5, 12, 18, 28].map(r => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: rate === r ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      background: rate === r ? '#fef2f2' : 'white',
                      color: rate === r ? '#dc2626' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <SliderInput 
                label="Custom Rate"
                value={rate} 
                min={0.1} 
                max={50} 
                step={0.1} 
                onChange={setRate} 
                suffix={<span className="unit-label">%</span>}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '16px' }}>
                   Tax Type
                </label>
                <div className="toggle-group" style={{ width: '100%', display: 'flex' }}>
                    <button 
                        className={`toggle-btn ${type === 'exclusive' ? 'active' : ''}`} 
                        onClick={() => setType('exclusive')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        Exclusive (Add Tax)
                    </button>
                    <button 
                        className={`toggle-btn ${type === 'inclusive' ? 'active' : ''}`} 
                        onClick={() => setType('inclusive')}
                        style={{ flex: 1, padding: '12px' }}
                    >
                        Inclusive (Remove Tax)
                    </button>
                </div>
            </div>
          </div>

          <div className="calc-right">
             <div className="result-card">
                <div className="result-title">Total Amount</div>
                <div className="result-amount" style={{ color: '#ef4444' }}>{formatCurrency(result.totalAmount, currency)}</div>
             </div>

             <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Net Amount</span>
                  <span className="stat-value">{formatCurrency(result.netAmount, currency)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">GST Amount</span>
                  <span className="stat-value" style={{ color: '#ef4444' }}>{formatCurrency(result.gstAmount, currency)}</span>
                </div>
             </div>
             
             <div style={{ marginTop: '24px', padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                 <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', lineHeight: '1.5' }}>
                    <strong>Note:</strong> 
                    {type === 'exclusive' 
                        ? ` Adding ${rate}% tax to ${formatCurrency(result.netAmount, currency)} results in a total of ${formatCurrency(result.totalAmount, currency)}.`
                        : ` The total ${formatCurrency(result.totalAmount, currency)} includes a tax of ${formatCurrency(result.gstAmount, currency)}.`
                    }
                 </p>
             </div>
          </div>
        </div>
    </Layout>
  );
};

export default GSTCalculator;