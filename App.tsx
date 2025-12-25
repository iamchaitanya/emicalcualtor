import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import EMICalculator from './EMICalculator';
import SIPCalculator from './SIPCalculator';
import InvestmentCalculator from './InvestmentCalculator';
import SWPCalculator from './SWPCalculator';
import GSTCalculator from './GSTCalculator';
import InterestCalculator from './InterestCalculator';
import MutualFundCalculator from './MutualFundCalculator';
import SCSSCalculator from './SCSSCalculator';
import APYCalculator from './APYCalculator';
import IncomeTaxCalculator from './IncomeTaxCalculator';
import SimpleCalculator from './SimpleCalculator';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emi-calculator" element={<EMICalculator />} />
        <Route path="/sip-calculator" element={<SIPCalculator />} />
        <Route path="/mutual-fund-calculator" element={<MutualFundCalculator />} />
        <Route path="/scss-calculator" element={<SCSSCalculator />} />
        <Route path="/apy-calculator" element={<APYCalculator />} />
        <Route path="/income-tax-calculator" element={<IncomeTaxCalculator />} />
        
        {/* Investment Calculators */}
        <Route path="/fd-calculator" element={<InvestmentCalculator type="fd" />} />
        <Route path="/rd-calculator" element={<InvestmentCalculator type="rd" />} />
        <Route path="/ppf-calculator" element={<InvestmentCalculator type="ppf" />} />
        <Route path="/lumpsum-calculator" element={<InvestmentCalculator type="lumpsum" />} />
        
        {/* Interest Calculators */}
        <Route path="/simple-interest-calculator" element={<InterestCalculator type="simple" />} />
        <Route path="/compound-interest-calculator" element={<InterestCalculator type="compound" />} />

        <Route path="/swp-calculator" element={<SWPCalculator />} />
        <Route path="/gst-calculator" element={<GSTCalculator />} />
        <Route path="/simple-calculator" element={<SimpleCalculator />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;