
import React, { useState, useEffect } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: React.ReactNode;
}

const SliderInput: React.FC<SliderInputProps> = ({ 
  label, value, min, max, step, onChange, prefix, suffix 
}) => {
  const locale = prefix === '₹' ? 'en-IN' : 'en-US';
  
  // Local state to manage the input string directly while typing
  const [localInputValue, setLocalInputValue] = useState(value.toLocaleString(locale));
  const [isFocused, setIsFocused] = useState(false);

  // Sync local input with prop value when not focused
  useEffect(() => {
    if (!isFocused) {
      setLocalInputValue(value.toLocaleString(locale));
    }
  }, [value, isFocused, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow digits and a single decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
        setLocalInputValue(rawValue);
        
        const numValue = Number(rawValue);
        if (!isNaN(numValue) && rawValue !== '') {
            onChange(numValue);
        } else if (rawValue === '') {
            onChange(0);
        }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setLocalInputValue(value.toString());
  };

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const bgStyle = {
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`
  };

  return (
    <div style={{ marginBottom: '28px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <label style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', flex: '0 0 200px' }}>{label}</label>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '200px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={isFocused ? localInputValue : value.toLocaleString(locale)}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '15px',
                textAlign: 'right',
                outline: 'none',
                color: '#1e293b',
                background: '#ffffff'
              }}
            />
          </div>

          {(prefix || suffix) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {prefix && (
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '16px', 
                  color: '#64748b' 
                }}>
                  {prefix}
                </span>
              )}
              {suffix}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, value)} 
          onChange={(e) => onChange(Number(e.target.value))}
          style={bgStyle}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', padding: '0 2px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            {prefix}{min.toLocaleString(locale)}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            {prefix}{max.toLocaleString(locale)}
        </span>
      </div>
    </div>
  );
};

export default SliderInput;
