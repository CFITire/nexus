import { NextResponse } from 'next/server';

export const revalidate = 1800; // 30 minutes

export interface SalesSummaryItem {
  customerNo: string;
  fiscalYear: number;
  sales: number;
  transactionCount: number;
}

// Dummy data for demonstration
const dummySalesData: SalesSummaryItem[] = [
  { customerNo: 'CUST001', fiscalYear: 2024, sales: 1250000, transactionCount: 145 },
  { customerNo: 'CUST001', fiscalYear: 2023, sales: 980000, transactionCount: 132 },
  { customerNo: 'CUST001', fiscalYear: 2022, sales: 875000, transactionCount: 118 },
  
  { customerNo: 'CUST002', fiscalYear: 2024, sales: 890000, transactionCount: 98 },
  { customerNo: 'CUST002', fiscalYear: 2023, sales: 750000, transactionCount: 87 },
  { customerNo: 'CUST002', fiscalYear: 2022, sales: 620000, transactionCount: 75 },
  
  { customerNo: 'CUST003', fiscalYear: 2024, sales: 1420000, transactionCount: 189 },
  { customerNo: 'CUST003', fiscalYear: 2023, sales: 1100000, transactionCount: 165 },
  { customerNo: 'CUST003', fiscalYear: 2022, sales: 950000, transactionCount: 142 },
  
  { customerNo: 'CUST004', fiscalYear: 2024, sales: 670000, transactionCount: 76 },
  { customerNo: 'CUST004', fiscalYear: 2023, sales: 580000, transactionCount: 68 },
  { customerNo: 'CUST004', fiscalYear: 2022, sales: 520000, transactionCount: 61 },
  
  { customerNo: 'CUST005', fiscalYear: 2024, sales: 2100000, transactionCount: 256 },
  { customerNo: 'CUST005', fiscalYear: 2023, sales: 1850000, transactionCount: 234 },
  { customerNo: 'CUST005', fiscalYear: 2022, sales: 1650000, transactionCount: 198 },
  
  { customerNo: 'CUST006', fiscalYear: 2024, sales: 450000, transactionCount: 52 },
  { customerNo: 'CUST006', fiscalYear: 2023, sales: 390000, transactionCount: 48 },
  { customerNo: 'CUST006', fiscalYear: 2022, sales: 320000, transactionCount: 41 },
];

export async function GET() {
  try {
    // Return dummy data sorted by fiscal year and sales
    const sortedData = dummySalesData.sort((a, b) => {
      if (a.fiscalYear !== b.fiscalYear) {
        return b.fiscalYear - a.fiscalYear; // Newest year first
      }
      return b.sales - a.sales; // Highest sales first
    });

    return NextResponse.json(sortedData, {
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600'
      }
    });

  } catch (error) {
    console.error('Error fetching sales summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}