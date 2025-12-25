import React from 'react';
import { useNavigate } from 'react-router-dom';

const CalculatorCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: string; 
  path?: string;
  disabled?: boolean;
}> = ({ title, description, icon, path, disabled }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => !disabled && path && navigate(path)}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid #e2e8f0',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        opacity: disabled ? 0.6 : 1,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={!disabled ? "hover-card" : ""}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: disabled ? '#f1f5f9' : '#eff6ff',
        color: disabled ? '#94a3b8' : '#3b82f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        <i className={icon}></i>
      </div>
      
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>{description}</p>
      </div>

      {!disabled && (
        <div style={{ marginTop: 'auto', paddingTop: '16px', width: '100%' }}>
           <span style={{ 
             fontSize: '14px', 
             fontWeight: 700, 
             color: '#3b82f6', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '8px' 
           }}>
             Launch Tool <i className="fas fa-arrow-right"></i>
           </span>
        </div>
      )}

      {disabled && (
        <div style={{ 
          position: 'absolute', top: '16px', right: '16px', 
          background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase'
        }}>
          Coming Soon
        </div>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 24px' }}>
      <style>{`
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px', marginTop: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Financial Tools <span style={{ color: '#3b82f6' }}>Suite</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            A collection of powerful calculators to help you plan your investments, loans, and taxes with precision.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <CalculatorCard 
            title="Smart EMI Pro" 
            description="Advanced loan calculator with prepayments, moratorium analysis, and interactive amortization charts."
            icon="fas fa-calculator"
            path="/emi-calculator"
          />

          <CalculatorCard 
            title="SIP Calculator" 
            description="Calculate the future value of your Systematic Investment Plans with projected returns."
            icon="fas fa-chart-line"
            path="/sip-calculator"
          />

          <CalculatorCard 
            title="GST Calculator" 
            description="Instantly calculate GST inclusive and exclusive amounts with detailed tax breakdowns."
            icon="fas fa-percentage"
            disabled
          />

          <CalculatorCard 
            title="FD Calculator" 
            description="Compute returns on your Fixed Deposits with compounding frequency options."
            icon="fas fa-university"
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default Home;