
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';

// Lazy load calculators to optimize initial bundle size
const EMICalculator = lazy(() => import('./EMICalculator'));
const SIPCalculator = lazy(() => import('./SIPCalculator'));
const InvestmentCalculator = lazy(() => import('./InvestmentCalculator'));
const IncomeTaxCalculator = lazy(() => import('./IncomeTaxCalculator'));
const LoanComparisonCalculator = lazy(() => import('./LoanComparisonCalculator'));
const LoanEligibilityCalculator = lazy(() => import('./LoanEligibilityCalculator'));
const GSTCalculator = lazy(() => import('./GSTCalculator'));
const SimpleCalculator = lazy(() => import('./SimpleCalculator'));
const SWPCalculator = lazy(() => import('./SWPCalculator'));
const SCSSCalculator = lazy(() => import('./SCSSCalculator'));
const APYCalculator = lazy(() => import('./APYCalculator'));
const MutualFundCalculator = lazy(() => import('./MutualFundCalculator'));
const InterestCalculator = lazy(() => import('./InterestCalculator'));

const PageLoader = () => (
  <div style={{ 
    height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', background: '#f8fafc' 
  }}>
    <div style={{ 
      width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6',
      borderRadius: '50%', animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600, fontSize: '14px' }}>Loading Tool...</p>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Loan Tools */}
          <Route path="/emi-calculator" element={<EMICalculator />} />
          <Route path="/loan-comparison" element={<LoanComparisonCalculator />} />
          <Route path="/loan-eligibility" element={<LoanEligibilityCalculator />} />
          
          {/* Investment Tools */}
          <Route path="/sip-calculator" element={<SIPCalculator />} />
          <Route path="/mutual-fund-calculator" element={<MutualFundCalculator />} />
          <Route path="/fd-calculator" element={<InvestmentCalculator type="fd" />} />
          <Route path="/rd-calculator" element={<InvestmentCalculator type="rd" />} />
          <Route path="/ppf-calculator" element={<InvestmentCalculator type="ppf" />} />
          <Route path="/lumpsum-calculator" element={<InvestmentCalculator type="lumpsum" />} />
          
          {/* Retirement & Interest Tools */}
          <Route path="/swp-calculator" element={<SWPCalculator />} />
          <Route path="/scss-calculator" element={<SCSSCalculator />} />
          <Route path="/apy-calculator" element={<APYCalculator />} />
          <Route path="/simple-interest" element={<InterestCalculator type="simple" />} />
          <Route path="/compound-interest" element={<InterestCalculator type="compound" />} />
          
          {/* Utility Tools */}
          <Route path="/income-tax-calculator" element={<IncomeTaxCalculator />} />
          <Route path="/gst-calculator" element={<GSTCalculator />} />
          <Route path="/simple-calculator" element={<SimpleCalculator />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
