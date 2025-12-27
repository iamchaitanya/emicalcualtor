
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';

const SimpleCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState('');
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const [isScientific, setIsScientific] = useState(false);
  const [isRad, setIsRad] = useState(true);

  const [historyList, setHistoryList] = useState<{expression: string, result: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const handleNumber = (num: string) => {
    if (showHistory) setShowHistory(false); 
    if (hasError) {
        setDisplay(num);
        setCalcHistory('');
        setHasError(false);
        setWaitingForOperand(false);
        return;
    }
    if (waitingForOperand) {
        setDisplay(num);
        setWaitingForOperand(false);
    } else {
        setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (showHistory) setShowHistory(false);
    if (hasError) return;
    if (op === '-' && (display === '0' || display === '(')) {
        handleNumber('-');
        return;
    }
    if (waitingForOperand) {
        if (calcHistory.length > 0) {
             const newHistory = calcHistory.trim().slice(0, -1) + ' ' + op + ' ';
             setCalcHistory(newHistory);
        }
    } else {
        setCalcHistory(calcHistory + display + ' ' + op + ' ');
        setWaitingForOperand(true);
    }
  };

  const handleFunc = (func: string) => {
      if (showHistory) setShowHistory(false);
      if (hasError) {
          setHasError(false);
          setDisplay(func + '(');
          setCalcHistory('');
          setWaitingForOperand(false);
          return;
      }
      if (waitingForOperand) {
          setDisplay(func + '(');
          setWaitingForOperand(false);
      } else {
          setDisplay(display === '0' ? func + '(' : display + func + '(');
      }
  };

  const handleEqual = () => {
    if (showHistory) setShowHistory(false);
    if (hasError) return;
    let fullExpression = calcHistory + display;
    if (!fullExpression) return; 
    const openParens = (fullExpression.match(/\(/g) || []).length;
    const closeParens = (fullExpression.match(/\)/g) || []).length;
    if (openParens > closeParens) {
        fullExpression += ')'.repeat(openParens - closeParens);
    }
    try {
        let evalExpr = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/√\(/g, 'Math.sqrt(');

        const degToRad = (val: number) => val * (Math.PI / 180);
        const runCalc = new Function('degToRad', `
            const sin = (x) => ${!isRad} ? Math.sin(degToRad(x)) : Math.sin(x);
            const cos = (x) => ${!isRad} ? Math.cos(degToRad(x)) : Math.cos(x);
            const tan = (x) => ${!isRad} ? Math.tan(degToRad(x)) : Math.tan(x);
            const log = Math.log10;
            const ln = Math.log;
            const sqrt = Math.sqrt;
            return ${evalExpr};
        `);

        const result = runCalc(degToRad);
        if (!isFinite(result) || isNaN(result)) {
            setDisplay('Error');
            setHasError(true);
        } else {
            const val = parseFloat(result.toFixed(10)); 
            const resultStr = String(val);
            setHistoryList(prev => [{ expression: fullExpression, result: resultStr }, ...prev].slice(0, 50));
            setDisplay(resultStr);
            setCalcHistory('');
            setWaitingForOperand(true);
        }
    } catch (e) {
        setDisplay('Error');
        setHasError(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setCalcHistory('');
    setWaitingForOperand(false);
    setHasError(false);
  };

  const handleDelete = () => {
      if (showHistory) return;
      if (hasError) { handleClear(); return; }
      if (waitingForOperand) return;
      if (display.length > 1) {
          if (display.endsWith('(')) {
              const funcs = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', '√'];
              let matched = false;
              for (const f of funcs) {
                  if (display.endsWith(f + '(')) {
                      setDisplay(display.slice(0, -(f.length + 1)) || '0');
                      matched = true;
                      break;
                  }
              }
              if (!matched) setDisplay(display.slice(0, -1));
          } else {
              setDisplay(display.slice(0, -1));
          }
      } else {
          setDisplay('0');
      }
  };

  const handlePercent = () => {
      if (showHistory) setShowHistory(false);
      if (hasError) return;
      const val = parseFloat(display);
      setDisplay(String(val / 100));
      setWaitingForOperand(true); 
  };
  
  const restoreHistoryItem = (result: string) => {
      setDisplay(result);
      setCalcHistory('');
      setWaitingForOperand(true);
      setShowHistory(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      const { key } = event;
      if (/[0-9]/.test(key)) handleNumber(key);
      else if (key === '.') handleNumber('.');
      else if (key === 'Enter' || key === '=') { event.preventDefault(); handleEqual(); }
      else if (key === 'Backspace') handleDelete();
      else if (key === 'Escape') handleClear();
      else if (key === '+') handleOperator('+');
      else if (key === '-') handleOperator('-');
      else if (key === '*') handleOperator('×');
      else if (key === '/') handleOperator('÷');
      else if (key === '%') handlePercent();
      else if (key === '^') handleOperator('^');
      else if (key === '(') handleNumber('(');
      else if (key === ')') handleNumber(')');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, calcHistory, waitingForOperand, hasError, showHistory, isRad]);

  const Button = ({ label, onClick, type = 'num', ariaLabel, style }: { label: React.ReactNode, onClick: () => void, type?: 'num' | 'op' | 'func' | 'eq' | 'sci', ariaLabel?: string, style?: React.CSSProperties }) => {
      let bgColor = '#ffffff'; 
      let textColor = '#1e293b'; 
      let fontSize = isScientific ? '16px' : '20px';
      let shadowColor = 'rgba(0,0,0,0.08)';
      let fontWeight = 600;

      if (type === 'func') { bgColor = '#f1f5f9'; textColor = '#475569'; } 
      else if (type === 'sci') { bgColor = '#f8fafc'; textColor = '#64748b'; fontSize = '14px'; fontWeight = 500; } 
      else if (type === 'op') { bgColor = '#eff6ff'; textColor = '#2563eb'; fontWeight = 700; fontSize = '22px'; } 
      else if (type === 'eq') { bgColor = '#3b82f6'; textColor = '#ffffff'; shadowColor = 'rgba(59, 130, 246, 0.3)'; fontWeight = 700; }

      return (
          <button
            onClick={onClick}
            aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
            style={{
                width: '100%',
                paddingTop: isScientific ? '75%' : '85%', 
                position: 'relative',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.02)',
                background: bgColor,
                color: textColor,
                fontSize: fontSize,
                fontWeight: fontWeight,
                cursor: 'pointer',
                transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 4px 6px -1px ${shadowColor}, 0 2px 4px -1px rgba(0,0,0,0.02)`,
                outline: 'none',
                ...style
            }}
          >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {label}
              </div>
          </button>
      );
  };

  return (
    <Layout title="General" titleHighlight="Calculator" icon="fas fa-calculator" iconColor="#3b82f6">
        <div style={{ maxWidth: isScientific ? '460px' : '360px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ background: '#ffffff', borderRadius: '32px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', position: 'relative', overflow: 'hidden', minHeight: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setIsScientific(!isScientific)} aria-label={`Switch to ${isScientific ? 'Standard' : 'Scientific'} Mode`} style={{ background: '#f1f5f9', border: 'none', color: isScientific ? '#3b82f6' : '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className={`fas ${isScientific ? 'fa-flask' : 'fa-calculator'}`} aria-hidden="true"></i>
                        {isScientific ? 'Scientific' : 'Standard'}
                    </button>
                    <button onClick={() => setShowHistory(!showHistory)} aria-label={showHistory ? "Close History" : "View History"} style={{ background: showHistory ? '#eff6ff' : 'transparent', border: 'none', color: showHistory ? '#3b82f6' : '#94a3b8', fontSize: '18px', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`fas ${showHistory ? 'fa-times' : 'fa-history'}`} aria-hidden="true"></i>
                    </button>
                </div>

                <div role="status" aria-live="polite" style={{ background: '#f8fafc', borderRadius: '20px', marginBottom: '24px', textAlign: 'right', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', wordBreak: 'break-all', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '16px', minHeight: '24px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{calcHistory}</div>
                    <div style={{ color: '#1e293b', fontSize: display.length > 12 ? '32px' : display.length > 9 ? '40px' : '48px', fontWeight: 700, lineHeight: '1.1' }}>{display}</div>
                </div>

                <div style={{ position: 'relative', height: isScientific ? '400px' : '380px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isScientific ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: '12px', position: 'absolute', width: '100%', opacity: showHistory ? 0 : 1, pointerEvents: showHistory ? 'none' : 'auto' }}>
                        {isScientific ? (
                            <>
                                <Button label={isRad ? "Rad" : "Deg"} ariaLabel={`Current mode: ${isRad ? 'Radians' : 'Degrees'}. Click to switch.`} type="sci" onClick={() => setIsRad(!isRad)} />
                                <Button label="(" ariaLabel="Open parenthesis" type="sci" onClick={() => handleNumber('(')} />
                                <Button label=")" ariaLabel="Close parenthesis" type="sci" onClick={() => handleNumber(')')} />
                                <Button label="AC" ariaLabel="Clear all" type="func" onClick={handleClear} style={{ color: '#ef4444' }} />
                                <Button label={<i className="fas fa-backspace"></i>} ariaLabel="Delete last character" type="func" onClick={handleDelete} />
                                <Button label="sin" ariaLabel="Sine function" type="sci" onClick={() => handleFunc('sin')} />
                                <Button label="cos" ariaLabel="Cosine function" type="sci" onClick={() => handleFunc('cos')} />
                                <Button label="tan" ariaLabel="Tangent function" type="sci" onClick={() => handleFunc('tan')} />
                                <Button label="%" ariaLabel="Percent" type="sci" onClick={handlePercent} />
                                <Button label="÷" ariaLabel="Divide" type="op" onClick={() => handleOperator('÷')} />
                                <Button label="ln" ariaLabel="Natural logarithm" type="sci" onClick={() => handleFunc('ln')} />
                                <Button label="7" onClick={() => handleNumber('7')} />
                                <Button label="8" onClick={() => handleNumber('8')} />
                                <Button label="9" onClick={() => handleNumber('9')} />
                                <Button label="×" ariaLabel="Multiply" type="op" onClick={() => handleOperator('×')} />
                                <Button label="log" ariaLabel="Logarithm base 10" type="sci" onClick={() => handleFunc('log')} />
                                <Button label="4" onClick={() => handleNumber('4')} />
                                <Button label="5" onClick={() => handleNumber('5')} />
                                <Button label="6" onClick={() => handleNumber('6')} />
                                <Button label="-" ariaLabel="Subtract" type="op" onClick={() => handleOperator('-')} />
                                <Button label="√" ariaLabel="Square root" type="sci" onClick={() => handleFunc('√')} />
                                <Button label="1" onClick={() => handleNumber('1')} />
                                <Button label="2" onClick={() => handleNumber('2')} />
                                <Button label="3" onClick={() => handleNumber('3')} />
                                <Button label="+" ariaLabel="Add" type="op" onClick={() => handleOperator('+')} />
                                <Button label="^" ariaLabel="Exponent" type="sci" onClick={() => handleOperator('^')} />
                                <Button label="e" ariaLabel="Euler's number" type="sci" onClick={() => handleNumber('e')} />
                                <Button label="0" onClick={() => handleNumber('0')} />
                                <Button label="." ariaLabel="Decimal point" onClick={() => handleNumber('.')} />
                                <Button label="=" ariaLabel="Calculate result" type="eq" onClick={handleEqual} />
                            </>
                        ) : (
                            <>
                                <Button label="AC" ariaLabel="Clear all" type="func" onClick={handleClear} style={{ color: '#ef4444' }} />
                                <Button label={<i className="fas fa-backspace"></i>} ariaLabel="Delete last character" type="func" onClick={handleDelete} />
                                <Button label="%" ariaLabel="Percent" type="func" onClick={handlePercent} />
                                <Button label="÷" ariaLabel="Divide" type="op" onClick={() => handleOperator('÷')} />
                                <Button label="7" onClick={() => handleNumber('7')} />
                                <Button label="8" onClick={() => handleNumber('8')} />
                                <Button label="9" onClick={() => handleNumber('9')} />
                                <Button label="×" ariaLabel="Multiply" type="op" onClick={() => handleOperator('×')} />
                                <Button label="4" onClick={() => handleNumber('4')} />
                                <Button label="5" onClick={() => handleNumber('5')} />
                                <Button label="6" onClick={() => handleNumber('6')} />
                                <Button label="-" ariaLabel="Subtract" type="op" onClick={() => handleOperator('-')} />
                                <Button label="1" onClick={() => handleNumber('1')} />
                                <Button label="2" onClick={() => handleNumber('2')} />
                                <Button label="3" onClick={() => handleNumber('3')} />
                                <Button label="+" ariaLabel="Add" type="op" onClick={() => handleOperator('+')} />
                                <Button label="0" onClick={() => handleNumber('0')} />
                                <Button label="00" onClick={() => handleNumber('00')} />
                                <Button label="." ariaLabel="Decimal point" onClick={() => handleNumber('.')} />
                                <Button label="=" ariaLabel="Calculate result" type="eq" onClick={handleEqual} />
                            </>
                        )}
                    </div>

                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: showHistory ? 1 : 0, pointerEvents: showHistory ? 'auto' : 'none', transform: showHistory ? 'translateY(0)' : 'translateY(20px)', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Recent Calculations</span>
                            {historyList.length > 0 && (
                                <button onClick={() => setHistoryList([])} aria-label="Clear all history" style={{ border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Clear All</button>
                            )}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }} ref={historyEndRef}>
                            {historyList.length === 0 ? (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true"><i className="fas fa-history" style={{ fontSize: '24px' }}></i></div>
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>No history yet</span>
                                </div>
                            ) : (
                                historyList.map((item, idx) => (
                                    <div key={idx} onClick={() => restoreHistoryItem(item.result)} role="button" aria-label={`Restore ${item.expression} = ${item.result}`} style={{ padding: '16px', marginBottom: '8px', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }} className="history-item">
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>{item.expression} =</div>
                                        <div style={{ fontSize: '20px', color: '#3b82f6', fontWeight: 700 }}>{item.result}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '24px', fontWeight: 500 }}>{showHistory ? 'Tap a calculation to reuse the result' : 'Smart Financial Calculator'}</p>
        </div>
        <style>{`.history-item:hover { background-color: #f8fafc; border-color: #e2e8f0 !important; }`}</style>
    </Layout>
  );
};

export default SimpleCalculator;
