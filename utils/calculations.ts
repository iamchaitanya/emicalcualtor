import { LoanDetails, EMIData, AmortizationMonth, InvestmentData, TaxSlab, TaxRegimeResult } from '../types';

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

  // 1. Handle Moratorium Period
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

  // Adjust balance after moratorium if simple capitalization
  if (moratoriumInterestMode === 'capitalize-simple' && activeMoratoriumMonths > 0) {
    currentBalance += accruedMoratoriumInterest;
    if (amortization.length > 0) amortization[amortization.length - 1].balance = currentBalance;
  }

  const remainingTenure = tenure - activeMoratoriumMonths;
  let emi = 0;

  if (remainingTenure > 0) {
    // Calculate Base EMI
    if (r > 0) {
      emi = (currentBalance * r * Math.pow(1 + r, remainingTenure)) / (Math.pow(1 + r, remainingTenure) - 1);
    } else {
      emi = currentBalance / remainingTenure;
    }

    // 2. Handle Repayment Period
    // We loop up to the tenure, but we might break early if extra payments clear the debt
    for (let i = activeMoratoriumMonths + 1; i <= tenure; i++) {
      // If balance is already zero (from previous iteration), break
      if (currentBalance <= 0.001) break;

      const interestForMonth = currentBalance * r;
      
      // Calculate Extra Payment
      let extraPayment = 0;
      
      if (prepayment.frequency === 'monthly') {
        if (prepayment.amount > 0) {
            extraPayment = prepayment.amount;
        }
      } else if (prepayment.frequency === 'yearly') {
        if (prepayment.amount > 0 && i % 12 === 0) {
            extraPayment = prepayment.amount;
        }
      } else if (prepayment.frequency === 'custom' && prepayment.customPayments) {
        // Handle list of custom payments for this specific month
        const paymentsForMonth = prepayment.customPayments.filter(p => p.month === i);
        paymentsForMonth.forEach(p => extraPayment += p.amount);
      }

      // Total amount user wants to pay this month
      let monthlyPayment = emi + extraPayment;
      
      // Calculate Principal component
      let monthlyPrincipal = monthlyPayment - interestForMonth;

      // Check if this payment exceeds the remaining balance
      if (monthlyPrincipal > currentBalance) {
        monthlyPrincipal = currentBalance;
        monthlyPayment = monthlyPrincipal + interestForMonth; // Adjust the final payment down
      }

      totalInterest += interestForMonth;
      totalPaid += monthlyPayment;
      currentBalance = Math.max(0, currentBalance - monthlyPrincipal);
      
      amortization.push({ 
        month: i, 
        principalPaid: monthlyPrincipal, 
        interestPaid: interestForMonth, 
        balance: currentBalance, 
        isMoratorium: false 
      });
      
      if (currentBalance <= 0.001) break; // Float safety check
    }
  }

  return { emi, totalInterest, totalPayment: totalPaid, amortization, moratoriumApplied: activeMoratoriumMonths > 0 };
};

export const calculateSIP = (
  monthlyInvestment: number, 
  rate: number, 
  years: number, 
  stepUpRate: number = 0
): InvestmentData => {
  const monthlyRate = (rate / 100) / 12;
  const totalMonths = years * 12;
  
  let currentBalance = 0;
  let totalInvested = 0;
  let currentMonthlyInvestment = monthlyInvestment;

  for (let m = 1; m <= totalMonths; m++) {
    // Add investment at start of month (or end depending on convention, usually SIP is start)
    // Here we treat it as: Invest -> Wait Month -> Add Interest
    currentBalance += currentMonthlyInvestment;
    totalInvested += currentMonthlyInvestment;
    
    // Add interest for the month
    currentBalance += currentBalance * monthlyRate;

    // Apply Step-up at the end of every year (every 12 months)
    if (stepUpRate > 0 && m % 12 === 0 && m !== totalMonths) {
      currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpRate / 100);
    }
  }

  return { 
    investedAmount: totalInvested, 
    estReturns: currentBalance - totalInvested, 
    totalValue: currentBalance 
  };
};

export const calculateLumpSum = (principal: number, rate: number, years: number): InvestmentData => {
  const r = rate / 100;
  const totalValue = principal * Math.pow(1 + r, years);
  return { investedAmount: principal, estReturns: totalValue - principal, totalValue };
};

export const calculatePPF = (yearlyInvestment: number, rate: number, years: number): InvestmentData => {
  // PPF is compounded annually
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
  // SCSS pays interest quarterly.
  const quarterlyRate = (rate / 100) / 4;
  const quarterlyIncome = principal * quarterlyRate;
  const totalInterest = quarterlyIncome * 4 * years;
  
  return {
    investedAmount: principal,
    estReturns: totalInterest,
    // For SCSS, Principal is returned at maturity. 
    // Total Value usually means Principal + Total Interest Earned over the tenure.
    totalValue: principal + totalInterest, 
    quarterlyIncome
  };
};

// APY Contribution Chart Data (Age: 18-40)
// Format: Age: { Pension1000: MonthlyContribution, ... }
const APY_DATA: Record<number, Record<number, number>> = {
  18: { 1000: 42, 2000: 84, 3000: 126, 4000: 168, 5000: 210 },
  19: { 1000: 46, 2000: 92, 3000: 138, 4000: 183, 5000: 228 },
  20: { 1000: 50, 2000: 100, 3000: 150, 4000: 198, 5000: 248 },
  21: { 1000: 54, 2000: 108, 3000: 162, 4000: 215, 5000: 269 },
  22: { 1000: 59, 2000: 117, 3000: 177, 4000: 234, 5000: 292 },
  23: { 1000: 64, 2000: 127, 3000: 192, 4000: 254, 5000: 318 },
  24: { 1000: 70, 2000: 139, 3000: 208, 4000: 277, 5000: 346 },
  25: { 1000: 76, 2000: 151, 3000: 226, 4000: 301, 5000: 376 },
  26: { 1000: 82, 2000: 164, 3000: 246, 4000: 327, 5000: 409 },
  27: { 1000: 90, 2000: 178, 3000: 268, 4000: 356, 5000: 446 },
  28: { 1000: 97, 2000: 194, 3000: 292, 4000: 388, 5000: 485 },
  29: { 1000: 106, 2000: 212, 3000: 318, 4000: 423, 5000: 529 },
  30: { 1000: 116, 2000: 231, 3000: 347, 4000: 462, 5000: 577 },
  31: { 1000: 126, 2000: 252, 3000: 379, 4000: 504, 5000: 630 },
  32: { 1000: 138, 2000: 276, 3000: 414, 4000: 551, 5000: 689 },
  33: { 1000: 151, 2000: 302, 3000: 453, 4000: 602, 5000: 752 },
  34: { 1000: 165, 2000: 330, 3000: 495, 4000: 659, 5000: 824 },
  35: { 1000: 181, 2000: 362, 3000: 543, 4000: 723, 5000: 902 },
  36: { 1000: 198, 2000: 396, 3000: 594, 4000: 792, 5000: 990 },
  37: { 1000: 218, 2000: 436, 3000: 654, 4000: 870, 5000: 1087 },
  38: { 1000: 240, 2000: 480, 3000: 720, 4000: 957, 5000: 1196 },
  39: { 1000: 264, 2000: 528, 3000: 792, 4000: 1054, 5000: 1318 },
  40: { 1000: 291, 2000: 582, 3000: 873, 4000: 1164, 5000: 1454 }
};

export const calculateAtalPensionYojana = (age: number, pensionAmount: number) => {
  const validAge = Math.max(18, Math.min(40, age));
  // Default to 1000 if not a valid pension amount, although UI controls this.
  const validPension = [1000, 2000, 3000, 4000, 5000].includes(pensionAmount) ? pensionAmount : 1000;
  
  const contributionMap = APY_DATA[validAge];
  const monthlyContribution = contributionMap ? contributionMap[validPension] : 0;
  
  const yearsToPay = 60 - validAge;
  const totalMonths = yearsToPay * 12;
  const investedAmount = monthlyContribution * totalMonths;
  
  // Corpus returned to nominee: 1.7L per 1000 pension roughly
  const corpusToNominee = (validPension / 1000) * 170000;
  
  const estReturns = corpusToNominee - investedAmount;

  return {
    monthlyContribution,
    yearsToPay,
    investedAmount,
    corpusToNominee,
    estReturns
  };
};

// Helper for generic slab calculation
const computeTaxWithSlabs = (taxableIncome: number, slabs: { limit: number; rate: number }[]) => {
  let tax = 0;
  let prevLimit = 0;
  const breakdown: TaxSlab[] = [];

  for (const slab of slabs) {
    if (prevLimit >= taxableIncome) {
        break;
    }
    
    const limit = slab.limit;
    const rate = slab.rate;
    
    // Amount in this slab
    const spread = limit === Infinity ? taxableIncome - prevLimit : Math.min(taxableIncome, limit) - prevLimit;
    
    // Only process if there is amount in this slab
    if (spread > 0) {
        const slabTax = spread * rate;
        tax += slabTax;
        
        const label = limit === Infinity 
           ? `> ₹${(prevLimit/100000).toFixed(2).replace(/\.00/, '')}L` 
           : `₹${(prevLimit/100000).toFixed(2).replace(/\.00/, '')}L - ₹${(limit/100000).toFixed(2).replace(/\.00/, '')}L`;
        
        breakdown.push({
          label,
          rate: `${(rate * 100)}%`,
          amount: slabTax,
          taxableAmount: spread 
        });
    }

    prevLimit = limit;
  }
  return { tax, breakdown };
}

export const calculateIncomeTax = (
  income: number, 
  age: '<60' | '60-80' | '>80',
  financialYear: 'FY 2024-25' | 'FY 2025-26',
  deductions: {
    section80C: number;
    section80D: number;
    hra: number;
    homeLoanInterest: number;
    nps: number;
    other: number;
  }
): { newRegime: TaxRegimeResult; oldRegime: TaxRegimeResult } => {
    
    // --- New Regime Calculation ---
    // Standard Deduction: 75000 for New Regime
    const stdDedNew = 75000; 
    const taxableIncomeNew = Math.max(0, income - stdDedNew);
    
    let taxNew = 0;
    let newRegimeSlabs: { limit: number; rate: number }[] = [];
    let rebateLimitNew = 0;

    if (financialYear === 'FY 2025-26') {
        // Budget 2025 New Slabs
        newRegimeSlabs = [
            { limit: 400000, rate: 0 },
            { limit: 800000, rate: 0.05 },
            { limit: 1200000, rate: 0.10 },
            { limit: 1600000, rate: 0.15 },
            { limit: 2000000, rate: 0.20 },
            { limit: 2400000, rate: 0.25 },
            { limit: Infinity, rate: 0.30 }
        ];
        rebateLimitNew = 1200000;
    } else {
        // FY 2024-25 New Slabs
        newRegimeSlabs = [
            { limit: 300000, rate: 0 },
            { limit: 700000, rate: 0.05 },
            { limit: 1000000, rate: 0.10 },
            { limit: 1200000, rate: 0.15 },
            { limit: 1500000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 }
        ];
        rebateLimitNew = 700000;
    }

    const newResult = computeTaxWithSlabs(taxableIncomeNew, newRegimeSlabs);
    taxNew = newResult.tax;
    
    // Apply Rebate 87A for New Regime
    let rebateNew = 0;
    if (taxableIncomeNew <= rebateLimitNew) {
        rebateNew = taxNew;
        taxNew = 0;
    }

    const cessNew = taxNew * 0.04;
    const totalTaxNew = taxNew + cessNew;


    // --- Old Regime Calculation ---
    const stdDedOld = 50000;
    const ded80C = Math.min(150000, deductions.section80C);
    const ded80D = deductions.section80D;
    const dedHRA = deductions.hra;
    const dedHomeLoan = Math.min(200000, deductions.homeLoanInterest);
    const dedNPS = Math.min(50000, deductions.nps); 
    const dedOther = deductions.other;

    const totalDeductionsOld = stdDedOld + ded80C + ded80D + dedHRA + dedHomeLoan + dedNPS + dedOther;
    const taxableIncomeOld = Math.max(0, income - totalDeductionsOld);

    let oldRegimeSlabs: { limit: number; rate: number }[] = [];
    
    if (age === '>80') {
        oldRegimeSlabs = [
            { limit: 500000, rate: 0 },
            { limit: 1000000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 }
        ];
    } else if (age === '60-80') {
        oldRegimeSlabs = [
            { limit: 300000, rate: 0 },
            { limit: 500000, rate: 0.05 },
            { limit: 1000000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 }
        ];
    } else {
        // < 60
        oldRegimeSlabs = [
            { limit: 250000, rate: 0 },
            { limit: 500000, rate: 0.05 },
            { limit: 1000000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 }
        ];
    }

    const oldResult = computeTaxWithSlabs(taxableIncomeOld, oldRegimeSlabs);
    let taxOld = oldResult.tax;
    
    // Apply Rebate 87A for Old Regime (Limit 5L)
    let rebateOld = 0;
    if (taxableIncomeOld <= 500000) {
        rebateOld = taxOld;
        taxOld = 0;
    }

    const cessOld = taxOld * 0.04;
    const totalTaxOld = taxOld + cessOld;

    return {
        newRegime: {
            taxableIncome: taxableIncomeNew,
            tax: totalTaxNew,
            cess: cessNew,
            baseTax: taxNew,
            slabs: newResult.breakdown,
            rebate87A: rebateNew
        },
        oldRegime: {
            taxableIncome: taxableIncomeOld,
            tax: totalTaxOld,
            cess: cessOld,
            baseTax: taxOld,
            totalDeductions: totalDeductionsOld,
            slabs: oldResult.breakdown,
            rebate87A: rebateOld
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
    if (balance <= 0) {
      balance = 0;
      break;
    }
  }
  
  return { investedAmount: initialCapital, estReturns: totalWithdrawn, totalValue: balance };
};

export const calculateFD = (principal: number, rate: number, years: number): InvestmentData => {
  const n = 4; // quarterly
  const totalValue = principal * Math.pow(1 + (rate / 100) / n, n * years);
  return { investedAmount: principal, estReturns: totalValue - principal, totalValue };
};

export const calculateRD = (monthlyInvestment: number, rate: number, years: number): InvestmentData => {
  const i = (rate / 100) / 4; 
  const n = years * 12;
  let totalValue = 0;
  for(let m = 1; m <= n; m++) {
    totalValue += monthlyInvestment * Math.pow(1 + i/3, (n - m + 1));
  }
  const investedAmount = monthlyInvestment * n;
  return { investedAmount, estReturns: totalValue - investedAmount, totalValue };
};

export const calculateSimpleInterest = (principal: number, rate: number, years: number): InvestmentData => {
  const interest = (principal * rate * years) / 100;
  return { investedAmount: principal, estReturns: interest, totalValue: principal + interest };
};

export const calculateGenericCompoundInterest = (principal: number, rate: number, years: number, frequency: number = 1): InvestmentData => {
  const r = rate / 100;
  const n = frequency;
  const t = years;
  const totalValue = principal * Math.pow(1 + r/n, n*t);
  return { investedAmount: principal, estReturns: totalValue - principal, totalValue };
};

export const calculateGST = (amount: number, rate: number, type: 'inclusive' | 'exclusive') => {
  if (type === 'exclusive') {
    const gstAmount = amount * (rate / 100);
    return { netAmount: amount, gstAmount, totalAmount: amount + gstAmount };
  } else {
    const netAmount = amount / (1 + (rate / 100));
    const gstAmount = amount - netAmount;
    return { netAmount, gstAmount, totalAmount: amount };
  }
};

export const calculateInflation = (amount: number, rate: number, years: number) => {
  const r = rate / 100;
  const futureValue = amount * Math.pow(1 + r, years);
  const purchasingPower = amount / Math.pow(1 + r, years);
  return { futureValue, purchasingPower };
};

export const calculateInterest = (principal: number, rate: number, years: number, type: 'simple' | 'compound') => {
  const r = rate / 100;
  if (type === 'simple') {
    const interest = principal * r * years;
    return { principal, interest, total: principal + interest };
  } else {
    const total = principal * Math.pow(1 + r, years);
    return { principal, interest: total - principal, total };
  }
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD', minimumFractionDigits: number = 0) => {
  const locale = currencyCode === 'INR' ? 'en-IN' : (navigator.language || 'en-US');
  try {
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: currencyCode, 
      minimumFractionDigits: minimumFractionDigits, 
      maximumFractionDigits: 2 
    }).format(amount);
  } catch (e) {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: 2
    }).format(amount);
  }
};

export const getCurrencySymbol = (currencyCode: string) => {
  const locale = currencyCode === 'INR' ? 'en-IN' : (navigator.language || 'en-US');
  try {
    return (0).toLocaleString(locale, { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim();
  } catch (e) {
    return currencyCode === 'INR' ? '₹' : '$';
  }
};

export const detectCurrencyFromLocale = (): string => {
  const locale = navigator.language || 'en-US';
  const region = locale.split('-')[1]?.toUpperCase();
  const regionToCurrency: Record<string, string> = { 'US': 'USD', 'GB': 'GBP', 'IN': 'INR', 'EU': 'EUR', 'DE': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'CA': 'CAD', 'AU': 'AUD', 'AE': 'AED', 'SG': 'SGD' };
  return regionToCurrency[region] || 'USD';
};