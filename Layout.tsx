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
      <style>{`
        .layout-header {
            background: #fff;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 32px;
            padding: 10px 0;
        }
        .header-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            min-width: 0;
            flex-shrink: 1;
        }
        .icon-box {
            width: 32px; 
            height: 32px; 
            background: ${iconColor}; 
            border-radius: 8px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-size: 16px;
            flex-shrink: 0;
        }
        .title-text {
            fontSize: 18px; 
            fontWeight: 800; 
            color: #1e293b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .actions-section {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }
        
        @media (max-width: 600px) {
            .layout-header { margin-bottom: 16px; }
            .title-text { fontSize: 16px; }
            .header-container { gap: 8px; }
        }
      `}</style>

      {/* Header */}
      <div className="layout-header">
        <div className="container header-container">
          <div className="logo-section" onClick={() => navigate('/')}>
            <div className="icon-box">
              <i className={icon}></i>
            </div>
            <span className="title-text">
              {title} {titleHighlight && <span style={{ color: iconColor }}>{titleHighlight}</span>}
            </span>
          </div>
          
          <div className="actions-section">
            {onCurrencyChange && currency && (
              <select 
                value={currency} 
                onChange={(e) => onCurrencyChange(e.target.value)}
                style={{ 
                    padding: '6px 8px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    background: '#f8fafc', 
                    fontWeight: 600, 
                    fontSize: '12px', 
                    color: '#334155', 
                    cursor: 'pointer', 
                    outline: 'none' 
                }}
              >
                {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            )}
            
            <button 
                onClick={() => navigate('/')}
                style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '13px',
                }}
            >
                <i className="fas fa-home"></i>
            </button>
          </div>
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
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>© {new Date().getFullYear()} Smart EMI Pro. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;