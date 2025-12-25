import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmortizationMonth } from '../types';
import { formatCurrency } from './calculations';

export const downloadExcel = (data: AmortizationMonth[]) => {
  const worksheetData = data.map(row => ({
    Month: row.month,
    Principal: row.principalPaid,
    Interest: row.interestPaid,
    'Total Payment': row.principalPaid + row.interestPaid,
    Balance: row.balance
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Amortization Schedule");
  XLSX.writeFile(workbook, "smart-emi-schedule.xlsx");
};

export const downloadPDF = (data: AmortizationMonth[], loanAmount: number, rate: number, tenure: number, currency: string) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Loan Amortization Schedule", 14, 22);

  // Summary
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Loan Amount: ${formatCurrency(loanAmount, currency)}`, 14, 32);
  doc.text(`Interest Rate: ${rate}%`, 14, 38);
  doc.text(`Tenure: ${tenure} months`, 14, 44);

  // Table
  const tableData = data.map(row => [
    row.month,
    formatCurrency(row.principalPaid, currency),
    formatCurrency(row.interestPaid, currency),
    formatCurrency(row.principalPaid + row.interestPaid, currency),
    formatCurrency(row.balance, currency)
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Month', 'Principal', 'Interest', 'Total Payment', 'Balance']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // Blue header matching app theme
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
        0: { cellWidth: 20 }, // Month
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
    }
  });

  doc.save("smart-emi-schedule.pdf");
};