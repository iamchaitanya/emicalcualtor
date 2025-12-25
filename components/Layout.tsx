import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrencySymbol } from '../utils/calculations';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  titleHighlight?: string;
  icon: string;
  iconColor?: string;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'USD ($)' },
  { code: 'INR', name: 'INR (₹)' },
  { code: 'EUR', name: 'EUR (€)' },
  { code: 'GBP', name: 'GBP (£)' },
  { code: 'JPY', name: 'JPY (¥)' },
  { code: 'AED', name: 'AED (د.إ)' },
];

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  titleHighlight, 
  icon, 
  iconColor = '#3b82f6',
  currency,
  onCurrencyChange
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', marginBottom: '40px' }}>
        <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: '32px', height: '32px', background: iconColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px' }}>
              <i className={icon}></i>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
              {title} {titleHighlight && <span style={{ color: iconColor }}>{titleHighlight}</span>}
            </span>
          </div>
          
          {onCurrencyChange && currency && (
            <select 
              value={currency} 
              onChange={(e) => onCurrencyChange(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, fontSize: '13px', color: '#334155', cursor: 'pointer', outline: 'none' }}
            >
              {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ flex: 1 }}>
        {children}
      </div>
      
      {/* Footer */}
      <div style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8 }}>
                <div style={{ width: '24px', height: '24px', background: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                  <i className="fas fa-calculator"></i>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>Smart EMI Pro</span>
            </div>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>© {new Date().getFullYear()} Smart EMI Pro. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;