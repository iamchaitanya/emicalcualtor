import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CalculatorCard: React.FC<{ 
  title: string; 
  icon: string; 
  iconColor?: string; 
  path?: string;
  disabled?: boolean;
}> = ({ title, icon, iconColor = '#3b82f6', path, disabled }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="calc-card"
      onClick={() => !disabled && path && navigate(path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--icon-color': iconColor,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        boxShadow: isHovered 
            ? `0 15px 25px -5px ${iconColor}15, 0 10px 10px -5px ${iconColor}10` 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        transform: isHovered && !disabled ? 'translateY(-4px)' : 'translateY(0)',
      } as React.CSSProperties}
    >
      {/* Decorative gradient blob in background */}
      <div className="calc-card-blob" style={{
          background: iconColor,
          opacity: isHovered ? 0.06 : 0.02,
      }} />

      <div className="calc-card-icon" style={{
        background: disabled ? '#f1f5f9' : `linear-gradient(135deg, ${iconColor}10 0%, ${iconColor}25 100%)`,
        color: disabled ? '#94a3b8' : iconColor,
        boxShadow: isHovered ? `0 10px 15px -3px ${iconColor}25` : 'none',
        transform: isHovered && !disabled ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
      }}>
        <i className={icon}></i>
      </div>
      
      <div className="calc-card-content">
        <h3>{title}</h3>
      </div>

      {disabled && (
        <div className="calc-card-badge">
          Soon
        </div>
      )}
    </div>
  );
};

// Tool Data Reorganized: EMI, SIP, Mutual Fund, Income Tax first
const TOOLS = [
  { title: "EMI Calculator", icon: "fas fa-calculator", path: "/emi-calculator", color: "#3b82f6" },
  { title: "SIP Calculator", icon: "fas fa-chart-line", path: "/sip-calculator", color: "#10b981" },
  { title: "Mutual Fund", icon: "fas fa-chart-pie", path: "/mutual-fund-calculator", color: "#8b5cf6" },
  { title: "Income Tax", icon: "fas fa-file-invoice-dollar", path: "/income-tax-calculator", color: "#3b82f6" },
  { title: "Lumpsum Calculator", icon: "fas fa-money-bill-wave", path: "/lumpsum-calculator", color: "#8b5cf6" },
  { title: "FD Calculator", icon: "fas fa-university", path: "/fd-calculator", color: "#f59e0b" },
  { title: "RD Calculator", icon: "fas fa-piggy-bank", path: "/rd-calculator", color: "#ec4899" },
  { title: "PPF Calculator", icon: "fas fa-shield-alt", path: "/ppf-calculator", color: "#14b8a6" },
  { title: "SCSS Calculator", icon: "fas fa-user-clock", path: "/scss-calculator", color: "#0ea5e9" },
  { title: "APY Calculator", icon: "fas fa-landmark", path: "/apy-calculator", color: "#e11d48" },
  { title: "SWP Calculator", icon: "fas fa-hand-holding-usd", path: "/swp-calculator", color: "#6366f1" },
  { title: "GST Calculator", icon: "fas fa-percentage", path: "/gst-calculator", color: "#ef4444" },
  { title: "Simple Interest", icon: "fas fa-percentage", path: "/simple-interest-calculator", color: "#f59e0b" },
  { title: "Compound Interest", icon: "fas fa-sync-alt", path: "/compound-interest-calculator", color: "#6366f1" },
];

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
       {/* Inject CSS for responsive grid */}
       <style>{`
        /* Card Layout */
        .calc-card {
            background: white;
            border-radius: 16px;
            padding: 12px 16px;
            border: 1px solid #f1f5f9;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: 16px;
            position: relative;
            overflow: hidden;
            height: 100%;
        }

        .calc-card-blob {
            position: absolute;
            top: -20%;
            right: -20%;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            filter: blur(40px);
            pointer-events: none;
            transition: all 0.5s ease;
        }

        .calc-card-icon {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
            transition: transform 0.3s ease;
        }

        .calc-card-content {
            z-index: 1;
            flex: 1;
        }

        .calc-card-content h3 {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: -0.01em;
            line-height: 1.3;
        }

        .calc-card-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Grid System */
        .home-grid {
          display: grid;
          grid-template-columns: 1fr; /* Single column for mobile */
          gap: 12px; /* Smaller gap on mobile */
          margin: 0 auto;
        }

        /* Desktop & Tablet Overrides */
        @media (min-width: 600px) {
          .home-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .calc-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 24px;
            gap: 20px;
            min-height: 180px;
            border-radius: 24px;
          }
          
          .calc-card-blob {
             width: 180px;
             height: 180px;
          }

          .calc-card-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            font-size: 24px;
          }

          .calc-card-content h3 {
             font-size: 17px;
          }
          
          .calc-card-badge {
             top: 20px; 
             right: 20px;
             padding: 5px 10px;
             font-size: 11px;
          }
        }
        
        @media (min-width: 900px) {
          .home-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        @media (min-width: 1200px) {
           .home-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 24px;
          }
        }
      `}</style>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px', marginTop: '10px' }}>
            <div style={{ 
                display: 'inline-block', 
                padding: '8px 16px', 
                background: '#eff6ff', 
                borderRadius: '30px', 
                color: '#3b82f6', 
                fontSize: '12px', 
                fontWeight: 700, 
                marginBottom: '20px', 
                border: '1px solid #dbeafe',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}>
               Finance Tools
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
              Smart Financial <br/><span style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
              }}>Calculators</span>
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>
              Plan your investments, loans, and taxes with confidence.
            </p>
          </div>

          <div className="home-grid">
            {TOOLS.map((tool, index) => (
                <CalculatorCard 
                    key={index}
                    title={tool.title}
                    icon={tool.icon}
                    iconColor={tool.color}
                    path={tool.path}
                />
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '40px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
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

export default Home;