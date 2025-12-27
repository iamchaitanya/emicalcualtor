import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  titleHighlight?: string;
  icon: string;
  iconColor?: string;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  description?: string;
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
  onCurrencyChange,
  description
}) => {
  const navigate = useNavigate();

  // SEO: Dynamic Metadata Engine
  useEffect(() => {
    const fullTitle = `${title} ${titleHighlight || ''} - Smart EMI Pro`.trim();
    document.title = fullTitle;
    
    // Update meta description if provided
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || `Calculate your ${title} with professional accuracy using Smart EMI Pro's interactive financial tools.`);
    }
    
    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [title, titleHighlight, description]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <style>{`
        .layout-header {
            background: #fff; border-bottom: 1px solid #e2e8f0; margin-bottom: 32px;
            padding: 10px 0; position: sticky; top: 0; z-index: 100;
        }
        .header-container { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .logo-section { display: flex; align-items: center; gap: 10px; cursor: pointer; min-width: 0; }
        .icon-box {
            width: 32px; height: 32px; background: ${iconColor}; border-radius: 8px; 
            display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; flex-shrink: 0;
        }
        .title-text { font-size: 18px; font-weight: 800; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
        .actions-section { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        
        @media (max-width: 600px) {
            .layout-header { margin-bottom: 16px; }
            .title-text { font-size: 16px; }
        }
      `}</style>

      <header className="layout-header">
        <div className="container header-container">
          <div className="logo-section" onClick={() => navigate('/')} role="link" aria-label="Go to Home">
            <div className="icon-box">
              <i className={icon} aria-hidden="true"></i>
            </div>
            <h1 className="title-text">
              {title} {titleHighlight && <span style={{ color: iconColor }}>{titleHighlight}</span>}
            </h1>
          </div>
          
          <div className="actions-section">
            {onCurrencyChange && currency && (
              <select 
                value={currency} 
                onChange={(e) => onCurrencyChange(e.target.value)}
                aria-label="Select Currency"
                style={{ 
                    padding: '6px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                    background: '#f8fafc', fontWeight: 600, fontSize: '12px', color: '#334155', cursor: 'pointer', outline: 'none' 
                }}
              >
                {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            )}
            
            <button 
                onClick={() => navigate('/')}
                aria-label="Home"
                style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: 'white', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px',
                }}
            >
                <i className="fas fa-home" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{ marginTop: '60px', borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.8 }}>
                <div style={{ width: '24px', height: '24px', background: '#3b82f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                  <i className="fas fa-calculator" aria-hidden="true"></i>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>Smart EMI Pro</span>
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>© {new Date().getFullYear()} Smart EMI Pro. High-performance financial suite.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;