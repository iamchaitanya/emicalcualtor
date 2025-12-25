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
      onClick={() => !disabled && path && navigate(path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '24px', // Slightly reduced padding for better fit in 5-col
        border: '1px solid #f1f5f9',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start', 
        textAlign: 'left',
        gap: '20px',
        opacity: disabled ? 0.6 : 1,
        boxShadow: isHovered 
            ? `0 15px 25px -5px ${iconColor}15, 0 10px 10px -5px ${iconColor}10` 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        transform: isHovered && !disabled ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: '180px' // Ensure uniform height look
      }}
    >
      {/* Decorative gradient blob in background */}
      <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '180px',
          height: '180px',
          background: iconColor,
          opacity: isHovered ? 0.06 : 0.02,
          borderRadius: '50%',
          filter: 'blur(50px)',
          transition: 'all 0.5s ease',
          pointerEvents: 'none'
      }} />

      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: disabled ? '#f1f5f9' : `linear-gradient(135deg, ${iconColor}10 0%, ${iconColor}25 100%)`,
        color: disabled ? '#94a3b8' : iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        transition: 'transform 0.3s ease',
        transform: isHovered && !disabled ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        boxShadow: isHovered ? `0 10px 15px -3px ${iconColor}25` : 'none'
      }}>
        <i className={icon}></i>
      </div>
      
      <div style={{ zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em', lineHeight: '1.3' }}>{title}</h3>
      </div>

      {disabled && (
        <div style={{ 
          position: 'absolute', top: '20px', right: '20px', 
          background: '#f1f5f9', padding: '5px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Soon
        </div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 0' }}>
       {/* Inject CSS for responsive grid */}
       <style>{`
        .home-grid {
          display: grid;
          grid-template-columns: 1fr; /* Force 1 column on mobile */
          gap: 16px;
          margin: 0 auto;
        }
        @media (min-width: 600px) {
          .home-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
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
            grid-template-columns: repeat(5, 1fr); /* 5 per row for desktop */
            gap: 24px;
          }
        }
      `}</style>

      {/* Use a custom container width to accommodate 5 columns better */}
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
          <CalculatorCard 
            title="EMI Calculator" 
            icon="fas fa-calculator"
            path="/emi-calculator"
          />

          <CalculatorCard 
            title="Income Tax" 
            icon="fas fa-file-invoice-dollar" 
            iconColor="#3b82f6"
            path="/income-tax-calculator"
          />
          
          <CalculatorCard 
            title="Basic Calculator" 
            icon="fas fa-calculator"
            iconColor="#64748b"
            path="/simple-calculator"
          />

          <CalculatorCard 
            title="SIP Calculator" 
            icon="fas fa-chart-line" 
            iconColor="#10b981"
            path="/sip-calculator"
          />

          <CalculatorCard 
            title="Mutual Fund" 
            icon="fas fa-chart-pie" 
            iconColor="#8b5cf6"
            path="/mutual-fund-calculator"
          />

          <CalculatorCard 
            title="SCSS Calculator" 
            icon="fas fa-user-clock" 
            iconColor="#0ea5e9"
            path="/scss-calculator"
          />
          
          <CalculatorCard 
            title="APY Calculator" 
            icon="fas fa-landmark" 
            iconColor="#e11d48"
            path="/apy-calculator"
          />

          <CalculatorCard 
            title="FD Calculator" 
            icon="fas fa-university" 
            iconColor="#f59e0b"
            path="/fd-calculator"
          />

          <CalculatorCard 
            title="RD Calculator" 
            icon="fas fa-piggy-bank" 
            iconColor="#ec4899"
            path="/rd-calculator"
          />

           <CalculatorCard 
            title="PPF Calculator" 
            icon="fas fa-shield-alt" 
            iconColor="#14b8a6"
            path="/ppf-calculator"
          />

           <CalculatorCard 
            title="Lumpsum Calculator" 
            icon="fas fa-money-bill-wave" 
            iconColor="#8b5cf6"
            path="/lumpsum-calculator"
          />

          <CalculatorCard 
            title="Simple Interest" 
            icon="fas fa-percentage" 
            iconColor="#f59e0b"
            path="/simple-interest-calculator"
          />

          <CalculatorCard 
            title="Compound Interest" 
            icon="fas fa-sync-alt" 
            iconColor="#6366f1"
            path="/compound-interest-calculator"
          />

           <CalculatorCard 
            title="SWP Calculator" 
            icon="fas fa-hand-holding-usd" 
            iconColor="#6366f1"
            path="/swp-calculator"
          />

          <CalculatorCard 
            title="GST Calculator" 
            icon="fas fa-percentage" 
            iconColor="#ef4444"
            path="/gst-calculator"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;