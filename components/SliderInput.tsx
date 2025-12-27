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
  
  const [localInputValue, setLocalInputValue] = useState(value.toLocaleString(locale));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalInputValue(value.toLocaleString(locale));
    }
  }, [value, isFocused, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
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
    <div style={{ marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .si-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
          width: 100%;
        }
        .si-label {
          font-weight: 700;
          font-size: 14px;
          color: #1e293b;
          line-height: 1.2;
          display: block;
        }
        .si-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .si-field {
          flex: 1;
          min-width: 0;
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          text-align: right;
          outline: none;
          color: #1e293b;
          background: #ffffff;
          height: 44px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .si-field:focus { border-color: #3b82f6; }
        
        @media (min-width: 600px) {
          .si-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .si-field {
            width: 140px;
            flex: none;
          }
          .si-input-wrap {
            width: auto;
          }
        }
      `}</style>

      <div className="si-header">
        <label className="si-label">{label}</label>
        <div className="si-input-wrap">
          <input
            type="text"
            className="si-field"
            value={isFocused ? localInputValue : value.toLocaleString(locale)}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {(prefix || suffix) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {prefix && <span style={{ fontWeight: 700, fontSize: '13px', color: '#64748b' }}>{prefix}</span>}
              {suffix}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))} 
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ ...bgStyle, cursor: 'pointer', width: '100%', height: '6px', borderRadius: '3px', appearance: 'none', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
            {prefix}{min.toLocaleString(locale)}
        </span>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8' }}>
            {prefix}{max.toLocaleString(locale)}
        </span>
      </div>
    </div>
  );
};

export default SliderInput;