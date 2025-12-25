
export interface CustomPrepayment {
  id: string;
  month: number;
  amount: number;
}

export interface LoanDetails {
  principal: number;
  interestRate: number;
  tenure: number; // total duration in months
  moratoriumMonths?: number;
  moratoriumInterestMode?: 'pay' | 'capitalize-simple' | 'capitalize-compound';
  prepayment?: {
    amount: number; // Used for monthly/yearly
    frequency: 'monthly' | 'yearly' | 'custom';
    customPayments?: CustomPrepayment[]; // Used for custom
  };
}

export interface EMIData {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  amortization: AmortizationMonth[];
  moratoriumApplied: boolean;
}

export interface AmortizationMonth {
  month: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
  isMoratorium?: boolean;
}

// Added InvestmentData interface to fix import error in utils/calculations.ts
export interface InvestmentData {
  investedAmount: number;
  estReturns: number;
  totalValue: number;
}

export type AppView = 'emi'; // Simplified focus
