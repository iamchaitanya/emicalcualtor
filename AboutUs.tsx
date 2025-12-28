
import React from 'react';
import Layout from './components/Layout';

const AboutUs: React.FC = () => {
  return (
    <Layout 
      title="About" 
      titleHighlight="Us" 
      icon="fas fa-info-circle" 
      iconColor="#3b82f6"
      description="Learn about Smart EMI Pro - your professional suite for financial planning, loan calculations, and investment projections."
    >
      <style>{`
        .about-section {
          background: white;
          padding: 40px;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          line-height: 1.7;
          color: #334155;
          margin-bottom: 32px;
        }
        .about-section h2 {
          color: #1e293b;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .about-section p {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }
        .value-card {
          padding: 24px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }
        .value-card i {
          font-size: 24px;
          color: #3b82f6;
          margin-bottom: 16px;
        }
        .value-card h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }
        @media (max-width: 600px) {
          .about-section { padding: 24px 20px; }
        }
      `}</style>

      <div className="about-section">
        <h2>Empowering Your Financial Future</h2>
        <p>
          Smart EMI Pro was built with a simple goal: to provide individuals and professionals with the most accurate, high-performance financial tools available on the web. We believe that clarity in numbers leads to confidence in life decisions.
        </p>
        <p>
          Whether you are planning to buy your first home, calculating your tax liability, or starting a wealth-building journey through SIPs, our tools are designed to give you instant, reliable answers.
        </p>

        <div className="values-grid">
          <div className="value-card">
            <i className="fas fa-bullseye"></i>
            <h3>Precision First</h3>
            <p>Our algorithms are rigorously tested to ensure they match bank-grade standards for interest and tax calculations.</p>
          </div>
          <div className="value-card">
            <i className="fas fa-user-shield"></i>
            <h3>Privacy Driven</h3>
            <p>We do not store your financial data. All calculations happen in your browser, keeping your personal info safe.</p>
          </div>
          <div className="value-card">
            <i className="fas fa-bolt"></i>
            <h3>High Performance</h3>
            <p>Built with modern technology for lightning-fast results, interactive charts, and seamless PDF exports.</p>
          </div>
        </div>
      </div>

      <div className="about-section" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
        <h2>The Suite</h2>
        <p>
          Smart EMI Pro isn't just an EMI calculator. It's an all-in-one financial dashboard featuring:
        </p>
        <ul style={{ paddingLeft: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <li><i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '8px' }}></i> Loan Comparisons</li>
          <li><i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '8px' }}></i> SIP & Mutual Fund Projections</li>
          <li><i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '8px' }}></i> Income Tax Planning</li>
          <li><i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '8px' }}></i> GST & Simple Calculations</li>
          <li><i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '8px' }}></i> Retirement (SWP/APY) Tools</li>
        </ul>
      </div>
    </Layout>
  );
};

export default AboutUs;
