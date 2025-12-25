
import { LoanDetails, EMIData, AmortizationMonth, InvestmentData } from '../types';

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
      let principalForMonth = monthlyPayment - interestForMonth;

      // Check if this payment exceeds the remaining balance
      if (principalForMonth > currentBalance) {
        principalForMonth = currentBalance;
        monthlyPayment = principalForMonth + interestForMonth; // Adjust the final payment down
      }

      totalInterest += interestForMonth;
      totalPaid += monthlyPayment;
      currentBalance = Math.max(0, currentBalance - principalForMonth);
      
      amortization.push({ 
        month: i, 
        principalPaid: principalForMonth, 
        interestPaid: interestForMonth, 
        balance: currentBalance, 
        isMoratorium: false 
      });
      
      if (currentBalance <= 0.001) break; // Float safety check
    }
  }

  return { emi, totalInterest, totalPayment: totalPaid, amortization, moratoriumApplied: activeMoratoriumMonths > 0 };
};

export const calculateSIP = (monthlyInvestment: number, rate: number, years: number): InvestmentData => {
  const i = (rate / 100) / 12;
  const n = years * 12;
  const investedAmount = monthlyInvestment * n;
  const totalValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  return { investedAmount, estReturns: totalValue - investedAmount, totalValue };
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
