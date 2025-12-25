import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import EMICalculator from './EMICalculator';
import SIPCalculator from './SIPCalculator';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/emi-calculator" element={<EMICalculator />} />
        <Route path="/sip-calculator" element={<SIPCalculator />} />
        {/* Catch all route to prevent blank page on 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;