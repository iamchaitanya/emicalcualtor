
import { LoanDetails, EMIData, AmortizationMonth, InvestmentData, TaxSlab } from '../types';

export const calculateEMI = (details: LoanDetails): EMIData => {
  const { 
    principal, 
    interestRate, 
    tenure, 
    moratoriumMonths = 0, 
    moratoriumInterestMode = 'capitalize-simple',
    prepayment = { amount: 0, frequency: 'monthly', customPayments: [] }
  } = details;
  
  const r = (interestRate / 12) / 100;
  const amortization: AmortizationMonth[] = [];
  let currentBalance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let accruedMoratoriumInterest = 0;

  const activeMoratoriumMonths = Math.min(moratoriumMonths, tenure - 1);

  for (let i = 1; i <= activeMoratoriumMonths; i++) {
    const interestForMonth = currentBalance * r;
    if (moratoriumInterestMode === 'pay') {
      totalInterest += interestForMonth;
      totalPaid += interestForMonth;
      amortization.push({ month: i, principalPaid: 0, interestPaid: interestForMonth, balance: currentBalance, isMoratorium: true });
    } else if (moratoriumInterestMode === 'capitalize-simple') {
      accruedMoratoriumInterest += interestForMonth;
      totalInterest += interestForMonth;
      amortization.push({ month: i, principalPaid: 0, interestPaid: interestForMonth, balance: currentBalance, isMoratorium: true });
    } else if (moratoriumInterestMode === 'capitalize-compound') {
      totalInterest += interestForMonth;
      currentBalance += interestForMonth;
      amortization.push({ month: i, principalPaid: 0, interestPaid: interestForMonth, balance: currentBalance, isMoratorium: true });
    }
  }

  if (moratoriumInterestMode === 'capitalize-simple' && activeMoratoriumMonths > 0) {
    currentBalance += accruedMoratoriumInterest;
    if (amortization.length > 0) amortization[amortization.length - 1].balance = currentBalance;
  }

  const remainingTenure = tenure - activeMoratoriumMonths;
  let emi = 0;

  if (remainingTenure > 0) {
    if (r > 0) {
      emi = (currentBalance * r * Math.pow(1 + r, remainingTenure)) / (Math.pow(1 + r, remainingTenure) - 1);
    } else {
      emi = currentBalance / remainingTenure;
    }

    for (let i = activeMoratoriumMonths + 1; i <= tenure; i++) {
      if (currentBalance <= 0.001) break;
      const interestForMonth = currentBalance * r;
      let extraPayment = 0;
      if (prepayment.frequency === 'monthly' && prepayment.amount > 0) extraPayment = prepayment.amount;
      else if (prepayment.frequency === 'yearly' && prepayment.amount > 0 && i % 12 === 0) extraPayment = prepayment.amount;
      else if (prepayment.frequency === 'custom' && prepayment.customPayments) {
        const paymentsForMonth = prepayment.customPayments.filter(p => p.month === i);
        paymentsForMonth.forEach(p => extraPayment += p.amount);
      }

      let monthlyPayment = emi + extraPayment;
      let monthlyPrincipal = monthlyPayment - interestForMonth;
      if (monthlyPrincipal > currentBalance) {
        monthlyPrincipal = currentBalance;
        monthlyPayment = monthlyPrincipal + interestForMonth;
      }

      totalInterest += interestForMonth;
      totalPaid += monthlyPayment;
      currentBalance = Math.max(0, currentBalance - monthlyPrincipal);
      amortization.push({ month: i, principalPaid: monthlyPrincipal, interestPaid: interestForMonth, balance: currentBalance, isMoratorium: false });
      if (currentBalance <= 0.001) break;
    }
  }

  return { emi, totalInterest, totalPayment: totalPaid, amortization, moratoriumApplied: activeMoratoriumMonths > 0 };
};

export const calculateLoanEligibility = (
  monthlyIncome: number,
  existingEMI: number,
  interestRate: number,
  tenureYears: number,
  foir: number = 50 
) => {
  const disposableIncome = (monthlyIncome * (foir / 100)) - existingEMI;
  if (disposableIncome <= 0) return 0;

  const r = (interestRate / 12) / 100;
  const n = tenureYears * 12;
  const maxLoan = (disposableIncome * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
  return Math.floor(maxLoan);
};

export const calculateSIP = (monthlyInvestment: number, rate: number, years: number, stepUpRate: number = 0): InvestmentData => {
  const monthlyRate = (rate / 100) / 12;
  const totalMonths = years * 12;
  let currentBalance = 0;
  let totalInvested = 0;
  let currentMonthlyInvestment = monthlyInvestment;
  for (let m = 1; m <= totalMonths; m++) {
    currentBalance += currentMonthlyInvestment;
    totalInvested += currentMonthlyInvestment;
    currentBalance += currentBalance * monthlyRate;
    if (stepUpRate > 0 && m % 12 === 0 && m !== totalMonths) {
      currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpRate / 100);
    }
  }
  return { investedAmount: totalInvested, estReturns: currentBalance - totalInvested, totalValue: currentBalance };
};

export const calculateLumpSum = (principal: number, rate: number, years: number): InvestmentData => {
  const r = rate / 100;
  const totalValue = principal * Math.pow(1 + r, years);
  return { investedAmount: principal, estReturns: totalValue - principal, totalValue };
};

export const calculatePPF = (yearlyInvestment: number, rate: number, years: number): InvestmentData => {
  const r = rate / 100;
  let totalValue = 0;
  for (let i = 0; i < years; i++) {
    totalValue = (totalValue + yearlyInvestment) * (1 + r);
  }
  const investedAmount = yearlyInvestment * years;
  return { investedAmount, estReturns: totalValue - investedAmount, totalValue };
};

export const calculateSCSS = (principal: number, rate: number, extended: boolean = false): InvestmentData & { quarterlyIncome: number } => {
  const years = extended ? 8 : 5;
  const quarterlyRate = (rate / 100) / 4;
  const quarterlyIncome = principal * quarterlyRate;
  const totalInterest = quarterlyIncome * 4 * years;
  return { investedAmount: principal, estReturns: totalInterest, totalValue: principal + totalInterest, quarterlyIncome };
};

export const calculateAtalPensionYojana = (age: number, pensionAmount: number) => {
  const validAge = Math.max(18, Math.min(40, age));
  const validPension = [1000, 2000, 3000, 4000, 5000].includes(pensionAmount) ? pensionAmount : 1000;
  const APY_DATA: any = { 18: { 1000: 42, 5000: 210 }, 25: { 1000: 76, 5000: 376 }, 40: { 1000: 291, 5000: 1454 } }; 
  const monthlyContribution = APY_DATA[validAge]?.[validPension] || (validPension / 1000) * 42; 
  const yearsToPay = 60 - validAge;
  const totalMonths = yearsToPay * 12;
  const investedAmount = monthlyContribution * totalMonths;
  const corpusToNominee = (validPension / 1000) * 170000;
  return { monthlyContribution, yearsToPay, investedAmount, corpusToNominee, estReturns: corpusToNominee - investedAmount };
};

const calculateSlabTax = (taxableIncome: number, slabs: { upper: number; rate: number }[]) => {
  let remaining = taxableIncome;
  let totalBaseTax = 0;
  const breakdown: TaxSlab[] = [];
  let previousLimit = 0;

  for (const slab of slabs) {
    const slabLimit = slab.upper - previousLimit;
    const slabAmount = Math.max(0, Math.min(remaining, slabLimit));
    const taxInSlab = slabAmount * (slab.rate / 100);
    
    // Always include slabs up to the income level, and include at least the first NIL slab
    if (slabAmount > 0 || previousLimit === 0 || previousLimit < taxableIncome) {
      breakdown.push({
        label: slab.upper === Infinity 
          ? `Above ₹${(previousLimit / 100000).toFixed(0)}L` 
          : `₹${(previousLimit / 100000).toFixed(0)}L - ₹${(slab.upper / 100000).toFixed(0)}L`,
        rate: `${slab.rate}%`,
        taxableAmount: slabAmount,
        amount: taxInSlab
      });
      totalBaseTax += taxInSlab;
    }
    
    remaining = Math.max(0, remaining - slabLimit);
    previousLimit = slab.upper;
    if (previousLimit >= taxableIncome && breakdown.length > 0) break;
  }

  return { totalBaseTax, breakdown };
};

export const calculateIncomeTax = (income: number, age: string, financialYear: string, deductions: any) => {
  const isFY2526 = financialYear === 'FY 2025-26';
  const stdDed = isFY2526 ? 75000 : 50000;
  
  // 1. NEW REGIME CALCULATION
  const taxableNew = Math.max(0, income - stdDed);
  
  const newRegimeSlabs = isFY2526 
    ? [
        { upper: 400000, rate: 0 },
        { upper: 800000, rate: 5 },
        { upper: 1200000, rate: 10 },
        { upper: 1500000, rate: 15 },
        { upper: 2000000, rate: 20 },
        { upper: Infinity, rate: 30 }
      ]
    : [
        { upper: 300000, rate: 0 },
        { upper: 600000, rate: 5 },
        { upper: 900000, rate: 10 },
        { upper: 1200000, rate: 15 },
        { upper: 1500000, rate: 20 },
        { upper: Infinity, rate: 30 }
      ];

  const newRes = calculateSlabTax(taxableNew, newRegimeSlabs);
  let baseTaxNew = newRes.totalBaseTax;
  let rebate87ANew = 0;
  
  const rebateThresholdNew = isFY2526 ? 1200000 : 700000;
  if (taxableNew <= rebateThresholdNew) {
    rebate87ANew = baseTaxNew;
    baseTaxNew = 0;
  }
  
  const cessNew = baseTaxNew * 0.04;

  // 2. OLD REGIME CALCULATION
  const totalDeductionsOld = stdDed + 
      (deductions.section80C || 0) + 
      (deductions.section80D || 0) + 
      (deductions.hra || 0) + 
      (deductions.homeLoanInterest || 0) + 
      (deductions.nps || 0);

  const taxableOld = Math.max(0, income - totalDeductionsOld);
  
  const oldLimit1 = age === '>80' ? 500000 : (age === '60-80' ? 300000 : 250000);
  const oldRegimeSlabs = [
    { upper: oldLimit1, rate: 0 },
    { upper: 500000, rate: 5 },
    { upper: 1000000, rate: 20 },
    { upper: Infinity, rate: 30 }
  ];

  const oldRes = calculateSlabTax(taxableOld, oldRegimeSlabs);
  let baseTaxOld = oldRes.totalBaseTax;
  let rebate87AOld = 0;

  if (taxableOld <= 500000) {
    rebate87AOld = baseTaxOld;
    baseTaxOld = 0;
  }

  const cessOld = baseTaxOld * 0.04;

  return { 
    newRegime: { 
      tax: baseTaxNew + cessNew, 
      taxableIncome: taxableNew, 
      slabs: newRes.breakdown, 
      cess: cessNew, 
      baseTax: baseTaxNew, 
      rebate87A: rebate87ANew,
      totalDeductions: stdDed 
    }, 
    oldRegime: { 
      tax: baseTaxOld + cessOld, 
      taxableIncome: taxableOld, 
      slabs: oldRes.breakdown, 
      cess: cessOld, 
      baseTax: baseTaxOld, 
      rebate87A: rebate87AOld,
      totalDeductions: totalDeductionsOld 
    } 
  };
};

export const calculateSWP = (initialCapital: number, withdrawalAmount: number, rate: number, years: number): InvestmentData => {
  const r = (rate / 100) / 12;
  const n = years * 12;
  let balance = initialCapital;
  let totalWithdrawn = 0;
  for (let i = 0; i < n; i++) {
    const interest = balance * r;
    balance = balance + interest - withdrawalAmount;
    totalWithdrawn += withdrawalAmount;
    if (balance <= 0) { balance = 0; break; }
  }
  return { investedAmount: initialCapital, estReturns: totalWithdrawn, totalValue: balance };
};

export const calculateFD = (principal: number, rate: number, years: number): InvestmentData => {
  const n = 4;
  const totalValue = principal * Math.pow(1 + (rate / 100) / n, n * years);
  return { investedAmount: principal, estReturns: totalValue - principal, totalValue };
};

export const calculateRD = (monthlyInvestment: number, rate: number, years: number): InvestmentData => {
  const i = (rate / 100) / 4; 
  const n = years * 12;
  let totalValue = 0;
  for(let m = 1; m <= n; m++) totalValue += monthlyInvestment * Math.pow(1 + i/3, (n - m + 1));
  return { investedAmount: monthlyInvestment * n, estReturns: totalValue - (monthlyInvestment * n), totalValue };
};

export const calculateSimpleInterest = (principal: number, rate: number, years: number): InvestmentData => {
  const interest = (principal * rate * years) / 100;
  return { investedAmount: principal, estReturns: interest, totalValue: principal + interest };
};

export const calculateGenericCompoundInterest = (principal: number, rate: number, years: number, frequency: number = 1): InvestmentData => {
  const totalValue = principal * Math.pow(1 + (rate / 100) / frequency, frequency * years);
  return { investedAmount: principal, estReturns: totalValue - principal, totalValue };
};

export const calculateGST = (amount: number, rate: number, type: 'inclusive' | 'exclusive') => {
  if (type === 'exclusive') {
    const gst = amount * (rate / 100);
    return { netAmount: amount, gstAmount: gst, totalAmount: amount + gst };
  } else {
    const net = amount / (1 + (rate / 100));
    return { netAmount: net, gstAmount: amount - net, totalAmount: amount };
  }
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD', minimumFractionDigits: number = 0) => {
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode, minimumFractionDigits }).format(amount);
};

export const getCurrencySymbol = (currencyCode: string) => {
  if (currencyCode === 'INR') return '₹';
  return '$';
};

export const detectCurrencyFromLocale = (): string => 'USD';
