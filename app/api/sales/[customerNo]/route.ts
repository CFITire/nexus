import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 1800; // 30 minutes

export interface SalesInvoiceDetail {
  soldToCustomerNo: string;
  invoiceNo: string;
  postingDate: string;
  orderDate: string | null;
  customerName: string;
  lineType: string;
  itemNo: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  vatAmount: number;
  amountIncludingVat: number;
  currencyCode: string | null;
  exchangeRate: number | null;
}

// Dummy data generator
function generateDummyInvoiceData(customerNo: string): SalesInvoiceDetail[] {
  const customerNames: { [key: string]: string } = {
    'CUST001': 'Acme Corporation',
    'CUST002': 'Global Industries Ltd',
    'CUST003': 'Tech Solutions Inc',
    'CUST004': 'Manufacturing Co',
    'CUST005': 'Enterprise Systems',
    'CUST006': 'Small Business LLC'
  };

  const items = [
    { itemNo: 'TIRE001', description: 'Heavy Duty Tire 18.4-38', unitPrice: 1250.00 },
    { itemNo: 'TIRE002', description: 'All-Season Tire 23.1-26', unitPrice: 980.00 },
    { itemNo: 'WHEEL001', description: 'Steel Wheel Rim 15x6', unitPrice: 425.00 },
    { itemNo: 'TUBE001', description: 'Inner Tube 18.4-38', unitPrice: 85.00 },
    { itemNo: 'VALVE001', description: 'Tire Valve TR218A', unitPrice: 12.50 },
    { itemNo: 'PATCH001', description: 'Tire Patch Kit', unitPrice: 35.00 },
    { itemNo: 'TOOL001', description: 'Tire Iron 24"', unitPrice: 65.00 },
    { itemNo: 'CHAIN001', description: 'Tire Chains 18.4-38', unitPrice: 275.00 }
  ];

  const data: SalesInvoiceDetail[] = [];
  const customerName = customerNames[customerNo] || `Customer ${customerNo}`;

  // Generate invoices for the last 18 months
  for (let monthsAgo = 0; monthsAgo < 18; monthsAgo++) {
    const invoiceDate = new Date();
    invoiceDate.setMonth(invoiceDate.getMonth() - monthsAgo);
    
    // Generate 3-8 invoices per month
    const invoicesThisMonth = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < invoicesThisMonth; i++) {
      const invoiceNo = `INV-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`;
      const orderDate = new Date(invoiceDate);
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 7)); // Order 0-7 days before invoice
      
      // Generate 1-5 line items per invoice
      const lineCount = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < lineCount; j++) {
        const item = items[Math.floor(Math.random() * items.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const unitPrice = item.unitPrice * (0.8 + Math.random() * 0.4); // ±20% price variation
        const lineAmount = quantity * unitPrice;
        const vatAmount = lineAmount * 0.1; // 10% VAT
        
        data.push({
          soldToCustomerNo: customerNo,
          invoiceNo,
          postingDate: invoiceDate.toISOString(),
          orderDate: orderDate.toISOString(),
          customerName,
          lineType: 'Item',
          itemNo: item.itemNo,
          description: item.description,
          quantity,
          unitPrice: Math.round(unitPrice * 100) / 100,
          lineAmount: Math.round(lineAmount * 100) / 100,
          vatAmount: Math.round(vatAmount * 100) / 100,
          amountIncludingVat: Math.round((lineAmount + vatAmount) * 100) / 100,
          currencyCode: 'USD',
          exchangeRate: 1.0
        });
      }
    }
  }

  return data.sort((a, b) => new Date(b.postingDate).getTime() - new Date(a.postingDate).getTime());
}

export async function GET(
  request: NextRequest,
  { params }: { params: { customerNo: string } }
) {
  try {
    const { customerNo } = params;
    
    if (!customerNo) {
      return NextResponse.json(
        { error: 'Customer number is required' }, 
        { status: 400 }
      );
    }

    // Get query parameters for pagination and filtering
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const sortBy = url.searchParams.get('sortBy') || 'postingDate';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const search = url.searchParams.get('search') || '';

    // Generate dummy data for this customer
    let allData = generateDummyInvoiceData(customerNo);

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allData = allData.filter(item => 
        item.invoiceNo.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.itemNo && item.itemNo.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    allData.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'postingDate':
          aVal = new Date(a.postingDate).getTime();
          bVal = new Date(b.postingDate).getTime();
          break;
        case 'lineAmount':
        case 'quantity':
        case 'unitPrice':
          aVal = a[sortBy as keyof SalesInvoiceDetail];
          bVal = b[sortBy as keyof SalesInvoiceDetail];
          break;
        default:
          aVal = String(a[sortBy as keyof SalesInvoiceDetail] || '').toLowerCase();
          bVal = String(b[sortBy as keyof SalesInvoiceDetail] || '').toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
    });

    // Apply pagination
    const totalCount = allData.length;
    const offset = (page - 1) * limit;
    const paginatedData = allData.slice(offset, offset + limit);

    const response = {
      data: paginatedData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      sorting: {
        sortBy,
        sortOrder
      },
      search
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Error fetching sales details:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}