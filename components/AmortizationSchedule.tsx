
import React, { useState, useMemo } from 'react';
import { AmortizationMonth } from '../types';
import { formatCurrency } from '../utils/calculations';

interface Props {
  data: AmortizationMonth[];
  currencyCode: string;
  startDate: string;
}

interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

const AmortizationSchedule: React.FC<Props> = ({ data, currencyCode, startDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Aggregate monthly data into calendar yearly buckets
  const yearlyData = useMemo(() => {
    const years: AmortizationYear[] = [];
    
    // Default to current date if startDate is missing (though it shouldn't be based on App.tsx)
    const [startY, startM] = startDate ? startDate.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    
    let currentYearPrincipal = 0;
    let currentYearInterest = 0;
    let trackingYear = -1;

    data.forEach((row, index) => {
      // row.month is 1-based index relative to loan start
      // Calculate the actual calendar year for this payment
      const date = new Date(startY, (startM - 1) + (row.month - 1));
      const rowYear = date.getFullYear();

      if (trackingYear === -1) trackingYear = rowYear;

      // If year changed, push previous year's accumulated data
      if (rowYear !== trackingYear) {
        years.push({
          year: trackingYear,
          principalPaid: currentYearPrincipal,
          interestPaid: currentYearInterest,
          balance: data[index - 1].balance // Balance at end of previous entry
        });
        
        // Reset for new year
        trackingYear = rowYear;
        currentYearPrincipal = 0;
        currentYearInterest = 0;
      }

      currentYearPrincipal += row.principalPaid;
      currentYearInterest += row.interestPaid;

      // If it's the last record, push the final year
      if (index === data.length - 1) {
        years.push({
          year: trackingYear,
          principalPaid: currentYearPrincipal,
          interestPaid: currentYearInterest,
          balance: row.balance
        });
      }
    });
    return years;
  }, [data, startDate]);

  const activeData = viewMode === 'monthly' ? data : yearlyData;
  const displayData = isExpanded ? activeData : activeData.slice(0, 10);
  
  const thStyle: React.CSSProperties = {
    padding: '16px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap'
  };

  const tdStyle: React.CSSProperties = {
    padding: '16px 16px',
    fontSize: '14px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>Payment Breakdown</h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            {viewMode === 'monthly' ? 'Monthly' : 'Calendar Yearly'} amortization schedule
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="toggle-group" style={{ background: '#e2e8f0' }}>
            <button 
              className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`} 
              onClick={() => setViewMode('monthly')}
            >
              Mo
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'yearly' ? 'active' : ''}`} 
              onClick={() => setViewMode('yearly')}
            >
              Yr
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>{viewMode === 'monthly' ? 'Month' : 'Year'}</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Principal</th>
              <th style={thStyle}>Interest</th>
              <th style={thStyle}>Total Payment</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, index) => {
              const isMonthly = 'month' in row;
              const isMoratorium = isMonthly ? (row as AmortizationMonth).isMoratorium : false;
              
              let col1Label: React.ReactNode;
              let col2Label = '-';
              
              if (isMonthly) {
                 col1Label = (row as AmortizationMonth).month;
                 if (startDate) {
                     const [y, m] = startDate.split('-').map(Number);
                     const d = new Date(y, (m - 1) + ((row as AmortizationMonth).month - 1));
                     col2Label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                 }
              } else {
                 // For yearly view, column 1 is the sequential index (1, 2, 3...)
                 col1Label = index + 1;
                 // For yearly view, column 2 is the Calendar Year
                 col2Label = (row as AmortizationYear).year.toString();
              }

              return (
                <tr key={isMonthly ? `m-${(row as AmortizationMonth).month}` : `y-${(row as AmortizationYear).year}`} style={{ background: isMoratorium ? '#fffbeb' : 'transparent' }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#94a3b8' }}>{col1Label}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#64748b' }}>{col2Label}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{formatCurrency(row.principalPaid, currencyCode, 2)}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(row.interestPaid, currencyCode, 2)}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(row.principalPaid + row.interestPaid, currencyCode, 2)}</td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>{formatCurrency(row.balance, currencyCode, 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {activeData.length > 10 && (
          <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0', position: 'sticky', left: 0 }}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ 
                background: 'white', 
                border: '1px solid #cbd5e1', 
                padding: '10px 24px', 
                borderRadius: '8px', 
                color: '#334155', 
                fontSize: '13px', 
                fontWeight: 700, 
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isExpanded ? (
                <>
                   Collapse List <i className="fas fa-chevron-up" style={{ fontSize: '10px' }}></i>
                </>
              ) : (
                <>
                   View Full Schedule ({activeData.length} {viewMode === 'monthly' ? 'Months' : 'Years'}) <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmortizationSchedule;
