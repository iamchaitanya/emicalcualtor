
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
    </div>
  );
};

const TOOLS = [
  // Top Tier (User Requested Order)
  { title: "EMI Calculator", icon: "fas fa-calculator", path: "/emi-calculator", color: "#3b82f6" },
  { title: "SIP Calculator", icon: "fas fa-chart-line", path: "/sip-calculator", color: "#10b981" },
  { title: "Mutual Fund", icon: "fas fa-chart-pie", path: "/mutual-fund-calculator", color: "#8b5cf6" },
  { title: "Income Tax", icon: "fas fa-file-invoice-dollar", path: "/income-tax-calculator", color: "#3b82f6" },
  
  // Loans & Borrowing
  { title: "Loan Comparison", icon: "fas fa-columns", path: "/loan-comparison", color: "#3b82f6" },
  { title: "Loan Eligibility", icon: "fas fa-user-check", path: "/loan-eligibility", color: "#3b82f6" },
  
  // Savings & Deposits
  { title: "Lumpsum", icon: "fas fa-money-bill-wave", path: "/lumpsum-calculator", color: "#8b5cf6" },
  { title: "FD Calculator", icon: "fas fa-university", path: "/fd-calculator", color: "#f59e0b" },
  { title: "RD Calculator", icon: "fas fa-piggy-bank", path: "/rd-calculator", color: "#ec4899" },
  { title: "PPF Calculator", icon: "fas fa-shield-alt", path: "/ppf-calculator", color: "#14b8a6" },
  
  // Retirement
  { title: "SWP Calculator", icon: "fas fa-hand-holding-usd", path: "/swp-calculator", color: "#6366f1" },
  { title: "SCSS Calculator", icon: "fas fa-user-clock", path: "/scss-calculator", color: "#0ea5e9" },
  { title: "Atal Pension (APY)", icon: "fas fa-landmark", path: "/apy-calculator", color: "#e11d48" },

  // Tax & Interest Utilities
  { title: "GST Calculator", icon: "fas fa-percentage", path: "/gst-calculator", color: "#ef4444" },
  { title: "Simple Interest", icon: "fas fa-percent", path: "/simple-interest", color: "#f59e0b" },
  { title: "Compound Interest", icon: "fas fa-sync-alt", path: "/compound-interest", color: "#8b5cf6" },
  { title: "General Calculator", icon: "fas fa-calculator", path: "/simple-calculator", color: "#64748b" },
];

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
       <style>{`
        .calc-card {
            background: white; border-radius: 16px; padding: 12px 16px; border: 1px solid #f1f5f9;
            transition: all 0.3s ease; display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden; height: 100%;
        }
        .calc-card-blob { position: absolute; top: -20%; right: -20%; width: 120px; height: 120px; border-radius: 50%; filter: blur(40px); pointer-events: none; transition: all 0.5s ease; }
        .calc-card-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; transition: transform 0.3s ease; }
        .calc-card-content { z-index: 1; flex: 1; }
        .calc-card-content h3 { margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; letter-spacing: -0.01em; line-height: 1.3; }
        .home-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 0 auto; }
        
        @media (min-width: 600px) {
          .home-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .calc-card { flex-direction: column; align-items: center; text-align: center; padding: 20px; gap: 16px; min-height: 160px; border-radius: 20px; }
          .calc-card-blob { width: 160px; height: 160px; }
          .calc-card-icon { width: 48px; height: 48px; border-radius: 14px; font-size: 20px; }
          .calc-card-content h3 { font-size: 15px; }
        }
        @media (min-width: 900px) { .home-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
        @media (min-width: 1200px) { .home-grid { grid-template-columns: repeat(4, 1fr); gap: 24px; } }
        @media (min-width: 1400px) { .home-grid { grid-template-columns: repeat(5, 1fr); gap: 24px; } }
      `}</style>
      <div style={{ flex: 1, padding: '24px 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.03em' }}>
              Smart Financial <span style={{ color: '#3b82f6' }}>Calculators</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>Professional tools for loans, savings, and tax planning.</p>
          </div>
          <div className="home-grid">
            {TOOLS.map((tool, index) => (
                <CalculatorCard key={index} title={tool.title} icon={tool.icon} iconColor={tool.color} path={tool.path} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
