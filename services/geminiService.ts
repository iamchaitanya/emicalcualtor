
import { GoogleGenAI } from "@google/genai";
import { LoanDetails, EMIData } from "../types";

export const getAIInsights = async (details: LoanDetails, emiData: EMIData, currencySymbol: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Act as a senior financial advisor. I have a loan with the following details:
    - Principal Amount: ${currencySymbol}${details.principal.toLocaleString()}
    - Annual Interest Rate: ${details.interestRate}%
    - Total Duration: ${details.tenure} months
    
    The calculated Monthly EMI is ${currencySymbol}${emiData.emi.toFixed(2)}.
    The Total Interest Payable is ${currencySymbol}${emiData.totalInterest.toFixed(2)}.
    The Total Payment over time is ${currencySymbol}${emiData.totalPayment.toFixed(2)}.

    Please provide:
    1. A brief analysis of this loan structure.
    2. 3 concrete strategies to reduce the total interest paid (e.g., specific prepayment targets or refinancing thresholds).
    3. A risk assessment of this loan burden relative to typical debt-to-income benchmarks.
    
    Important: Use the ${currencySymbol} symbol in all your numerical examples.
    Keep the tone professional, encouraging, and clear. Format the output with clear bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "No insights available at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't generate insights right now. Please check your connection and try again.";
  }
};
