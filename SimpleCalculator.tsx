import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';

const SimpleCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState(''); // Current calculation string (e.g. "5 + ")
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Modes
  const [isScientific, setIsScientific] = useState(false);
  const [isRad, setIsRad] = useState(true); // Radians vs Degrees

  // History Feature State
  const [historyList, setHistoryList] = useState<{expression: string, result: string}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Helper to append numbers or constants
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

  // Helper for operators
  const handleOperator = (op: string) => {
    if (showHistory) setShowHistory(false);
    if (hasError) return;

    // Allow unary minus for negative numbers at start or after (
    if (op === '-' && (display === '0' || display === '(')) {
        handleNumber('-');
        return;
    }

    if (waitingForOperand) {
        // Replace the last operator if we are just switching
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

    // Auto-close parentheses if missing
    const openParens = (fullExpression.match(/\(/g) || []).length;
    const closeParens = (fullExpression.match(/\)/g) || []).length;
    if (openParens > closeParens) {
        fullExpression += ')'.repeat(openParens - closeParens);
    }

    try {
        // Prepare expression for JS evaluation
        // 1. Replacements for visual symbols
        let evalExpr = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/√\(/g, 'Math.sqrt(');

        // 2. Wrap Trig functions to handle Deg/Rad
        const degToRad = (val: number) => val * (Math.PI / 180);

        // Construct a safe evaluation function with math context
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
            // limit decimals to fit screen
            const val = parseFloat(result.toFixed(10)); 
            const resultStr = String(val);
            
            setHistoryList(prev => [{ expression: fullExpression, result: resultStr }, ...prev].slice(0, 50));

            setDisplay(resultStr);
            setCalcHistory('');
            setWaitingForOperand(true);
        }
    } catch (e) {
        console.error(e);
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
      if (hasError) {
          handleClear();
          return;
      }
      if (waitingForOperand) return;

      if (display.length > 1) {
          // Handle deleting complex tokens like 'sin(' or 'log('
          if (display.endsWith('(')) {
              // Try to remove known functions
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
      const res = String(val / 100);
      setDisplay(res);
      setWaitingForOperand(true); 
  };
  
  const restoreHistoryItem = (result: string) => {
      setDisplay(result);
      setCalcHistory('');
      setWaitingForOperand(true);
      setShowHistory(false);
  };

  const clearHistoryList = (e: React.MouseEvent) => {
      e.stopPropagation();
      setHistoryList([]);
  };

  // Keyboard support updated for scientific keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return; // Ignore if typing in an input elsewhere
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, calcHistory, waitingForOperand, hasError, showHistory, isRad]);

  // UI Components
  const Button = ({ label, onClick, type = 'num', style, className }: { label: React.ReactNode, onClick: () => void, type?: 'num' | 'op' | 'func' | 'eq' | 'sci', style?: React.CSSProperties, className?: string }) => {
      let bgColor = '#ffffff'; 
      let textColor = '#1e293b'; 
      let fontSize = isScientific ? '16px' : '20px';
      let shadowColor = 'rgba(0,0,0,0.08)';
      let fontWeight = 600;

      if (type === 'func') { // AC, Del
          bgColor = '#f1f5f9'; 
          textColor = '#475569'; 
      } else if (type === 'sci') { // sin, cos, etc.
          bgColor = '#f8fafc'; 
          textColor = '#64748b';
          fontSize = '14px'; 
          fontWeight = 500;
      } else if (type === 'op') { // +, -, *, /
          bgColor = '#eff6ff'; 
          textColor = '#2563eb'; 
          fontWeight = 700;
          fontSize = '22px';
      } else if (type === 'eq') { // =
          bgColor = '#3b82f6'; 
          textColor = '#ffffff'; 
          shadowColor = 'rgba(59, 130, 246, 0.3)';
          fontWeight = 700;
      }

      return (
          <button
            onClick={(e) => {
                const btn = e.currentTarget;
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 100);
                onClick();
            }}
            className={className}
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
                userSelect: 'none',
                ...style
            }}
          >
              <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
              }}>
                  {label}
              </div>
          </button>
      );
  };

  return (
    <Layout title="General" titleHighlight="Calculator" icon="fas fa-calculator" iconColor="#3b82f6">
        <div style={{ maxWidth: isScientific ? '460px' : '360px', margin: '0 auto', paddingBottom: '40px', transition: 'max-width 0.3s ease-out' }}>
            
            {/* Calculator Body */}
            <div style={{ 
                background: '#ffffff', 
                borderRadius: '32px', 
                padding: '24px', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '600px' 
            }}>
                
                {/* Header Actions (Mode & History) */}
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <button 
                        onClick={() => setIsScientific(!isScientific)}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            color: isScientific ? '#3b82f6' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className={`fas ${isScientific ? 'fa-flask' : 'fa-calculator'}`}></i>
                        {isScientific ? 'Scientific' : 'Standard'}
                    </button>

                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        style={{
                            background: showHistory ? '#eff6ff' : 'transparent',
                            border: 'none',
                            color: showHistory ? '#3b82f6' : '#94a3b8',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="History"
                    >
                        <i className={`fas ${showHistory ? 'fa-times' : 'fa-history'}`}></i>
                    </button>
                </div>

                {/* Display Screen */}
                <div style={{ 
                    background: '#f8fafc',
                    borderRadius: '20px',
                    marginBottom: '24px', 
                    textAlign: 'right', 
                    height: '140px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-end',
                    padding: '20px',
                    wordBreak: 'break-all',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ 
                        color: '#64748b', 
                        fontSize: '16px', 
                        minHeight: '24px', 
                        marginBottom: '4px',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        opacity: 0.8,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {calcHistory}
                    </div>
                    <div style={{ 
                        color: '#1e293b', 
                        fontSize: display.length > 12 ? '32px' : display.length > 9 ? '40px' : '48px', 
                        fontWeight: 700, 
                        lineHeight: '1.1',
                        letterSpacing: '-1px',
                        transition: 'font-size 0.2s'
                    }}>
                        {display}
                    </div>
                </div>

                {/* Keypad Container */}
                <div style={{ position: 'relative', height: isScientific ? '400px' : '380px', transition: 'height 0.3s' }}>
                    
                    {/* Main Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isScientific ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', 
                        gap: '12px',
                        position: 'absolute',
                        width: '100%',
                        transition: 'opacity 0.2s, transform 0.2s',
                        opacity: showHistory ? 0 : 1,
                        pointerEvents: showHistory ? 'none' : 'auto',
                        transform: showHistory ? 'scale(0.95)' : 'scale(1)'
                    }}>
                        {isScientific ? (
                            <>
                                {/* Scientific Layout */}
                                {/* Row 1 */}
                                <Button label={isRad ? "Rad" : "Deg"} type="sci" onClick={() => setIsRad(!isRad)} />
                                <Button label="(" type="sci" onClick={() => handleNumber('(')} />
                                <Button label=")" type="sci" onClick={() => handleNumber(')')} />
                                <Button label="AC" type="func" onClick={handleClear} style={{ color: '#ef4444' }} />
                                <Button label={<i className="fas fa-backspace"></i>} type="func" onClick={handleDelete} />
                                
                                {/* Row 2 */}
                                <Button label="sin" type="sci" onClick={() => handleFunc('sin')} />
                                <Button label="cos" type="sci" onClick={() => handleFunc('cos')} />
                                <Button label="tan" type="sci" onClick={() => handleFunc('tan')} />
                                <Button label="%" type="sci" onClick={handlePercent} />
                                <Button label="÷" type="op" onClick={() => handleOperator('÷')} />

                                {/* Row 3 */}
                                <Button label="ln" type="sci" onClick={() => handleFunc('ln')} />
                                <Button label="7" onClick={() => handleNumber('7')} />
                                <Button label="8" onClick={() => handleNumber('8')} />
                                <Button label="9" onClick={() => handleNumber('9')} />
                                <Button label="×" type="op" onClick={() => handleOperator('×')} />

                                {/* Row 4 */}
                                <Button label="log" type="sci" onClick={() => handleFunc('log')} />
                                <Button label="4" onClick={() => handleNumber('4')} />
                                <Button label="5" onClick={() => handleNumber('5')} />
                                <Button label="6" onClick={() => handleNumber('6')} />
                                <Button label="-" type="op" onClick={() => handleOperator('-')} />

                                {/* Row 5 */}
                                <Button label="√" type="sci" onClick={() => handleFunc('√')} />
                                <Button label="1" onClick={() => handleNumber('1')} />
                                <Button label="2" onClick={() => handleNumber('2')} />
                                <Button label="3" onClick={() => handleNumber('3')} />
                                <Button label="+" type="op" onClick={() => handleOperator('+')} />

                                {/* Row 6 */}
                                <Button label="^" type="sci" onClick={() => handleOperator('^')} />
                                <Button label="e" type="sci" onClick={() => handleNumber('e')} />
                                <Button label="0" onClick={() => handleNumber('0')} />
                                <Button label="." onClick={() => handleNumber('.')} />
                                <Button label="=" type="eq" onClick={handleEqual} />
                            </>
                        ) : (
                            <>
                                {/* Standard Layout */}
                                <Button label="AC" type="func" onClick={handleClear} style={{ color: '#ef4444' }} />
                                <Button label={<i className="fas fa-backspace"></i>} type="func" onClick={handleDelete} />
                                <Button label="%" type="func" onClick={handlePercent} />
                                <Button label="÷" type="op" onClick={() => handleOperator('÷')} />

                                <Button label="7" onClick={() => handleNumber('7')} />
                                <Button label="8" onClick={() => handleNumber('8')} />
                                <Button label="9" onClick={() => handleNumber('9')} />
                                <Button label="×" type="op" onClick={() => handleOperator('×')} />

                                <Button label="4" onClick={() => handleNumber('4')} />
                                <Button label="5" onClick={() => handleNumber('5')} />
                                <Button label="6" onClick={() => handleNumber('6')} />
                                <Button label="-" type="op" onClick={() => handleOperator('-')} />

                                <Button label="1" onClick={() => handleNumber('1')} />
                                <Button label="2" onClick={() => handleNumber('2')} />
                                <Button label="3" onClick={() => handleNumber('3')} />
                                <Button label="+" type="op" onClick={() => handleOperator('+')} />

                                <Button label="0" onClick={() => handleNumber('0')} />
                                <Button label="00" onClick={() => handleNumber('00')} />
                                <Button label="." onClick={() => handleNumber('.')} />
                                <Button label="=" type="eq" onClick={handleEqual} />
                            </>
                        )}
                    </div>

                    {/* History Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        opacity: showHistory ? 1 : 0,
                        pointerEvents: showHistory ? 'auto' : 'none',
                        transform: showHistory ? 'translateY(0)' : 'translateY(20px)',
                        borderRadius: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '16px 20px', borderBottom: '1px solid #e2e8f0' 
                        }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Recent Calculations
                            </span>
                            {historyList.length > 0 && (
                                <button 
                                    onClick={clearHistoryList}
                                    style={{ 
                                        border: 'none', background: 'transparent', color: '#ef4444', 
                                        fontWeight: 600, fontSize: '12px', cursor: 'pointer', padding: '4px 8px',
                                        borderRadius: '6px'
                                    }}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }} ref={historyEndRef}>
                            {historyList.length === 0 ? (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fas fa-history" style={{ fontSize: '24px' }}></i>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>No history yet</span>
                                </div>
                            ) : (
                                historyList.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => restoreHistoryItem(item.result)}
                                        style={{ 
                                            padding: '16px', marginBottom: '8px', borderRadius: '12px', cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px',
                                            transition: 'background 0.2s',
                                            border: '1px solid transparent'
                                        }}
                                        className="history-item"
                                    >
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>{item.expression} =</div>
                                        <div style={{ fontSize: '20px', color: '#3b82f6', fontWeight: 700 }}>{item.result}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
            
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '24px', fontWeight: 500 }}>
                {showHistory ? 'Tap a calculation to reuse the result' : 'Smart Financial Calculator'}
            </p>
        </div>
        
        {/* Style injection for interactive elements */}
        <style>{`
            .history-item:hover {
                background-color: #f8fafc;
                border-color: #e2e8f0 !important;
            }
            button:active {
                transform: scale(0.96);
            }
        `}</style>
    </Layout>
  );
};

export default SimpleCalculator;