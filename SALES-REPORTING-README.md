# Sales Reporting Module

A comprehensive sales reporting module for CFI Nexus that provides sales analytics by customer with drill-down capabilities.

## Features

- **Sales Summary Dashboard**: Interactive bar chart showing sales by customer for the last 3 fiscal years
- **Customer Drill-down**: Detailed invoice line view with sorting, filtering, and pagination
- **Real-time Data**: Direct integration with Azure SQL Database views
- **Responsive Design**: Mobile-friendly interface using shadcn/ui components
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Lazy loading, caching, and optimized queries

## Architecture

### Backend
- **SQL Views**: `vw_SalesByCustomerYear` and `vw_SalesInvoicesByCustomer`
- **API Routes**: RESTful endpoints at `/api/sales/summary` and `/api/sales/[customerNo]`
- **Database**: Azure SQL Database with covering indexes for performance
- **ORM**: Prisma with read-only models for the views

### Frontend
- **Framework**: Next.js 15 with App Router
- **State Management**: TanStack Query for server state
- **Charts**: ECharts with accessibility features
- **Data Grid**: TanStack Table with sorting, filtering, and pagination
- **UI Components**: shadcn/ui with consistent styling

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the required views and indexes:

```sql
-- Execute this in your Azure SQL Database
-- File: scripts/sales-reporting-setup.sql
```

The script creates:
- `vw_SalesByCustomerYear` - Aggregated sales data by customer and fiscal year
- `vw_SalesInvoicesByCustomer` - Detailed invoice line data
- Covering indexes for optimal performance
- Placeholder for Row-Level Security (customize as needed)

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
# Database connection (should already be configured)
DATABASE_URL="sqlserver://server:port;database=your_db;username=user;password=pass;encrypt=true"

# Authentication (should already be configured)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### 3. Dependencies Installation

The required dependencies are already installed, but if you need to install them separately:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools echarts echarts-for-react
```

### 4. Database Schema Update

Generate the Prisma client with the new models:

```bash
npx prisma generate
```

### 5. Development Server

Start the development server:

```bash
npm run dev
```

The sales reporting module will be available at:
- Summary: `http://localhost:3000/sales`
- Customer Detail: `http://localhost:3000/sales/[customerNo]`

## Usage

### Sales Summary Page (`/sales`)

- View sales performance across all customers for the last 3 fiscal years
- Interactive stacked bar chart with hover tooltips
- Summary cards showing total sales, transactions, and customer count
- Click any customer bar to drill down to detailed invoice lines

### Customer Detail Page (`/sales/[customerNo]`)

- Detailed view of all invoice lines for a specific customer
- Search functionality across invoice numbers, items, and descriptions
- Sortable columns (invoice no, posting date, quantity, unit price, line amount)
- Pagination with configurable page sizes
- Summary cards showing record count, page total, and customer name
- Breadcrumb navigation back to summary

## API Endpoints

### GET `/api/sales/summary`

Returns aggregated sales data by customer and fiscal year.

**Response:**
```json
[
  {
    "customerNo": "CUST001",
    "fiscalYear": 2024,
    "sales": 125000.00,
    "transactionCount": 45
  }
]
```

**Caching:** 30 minutes with stale-while-revalidate

### GET `/api/sales/[customerNo]`

Returns detailed invoice line data for a specific customer.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 50)
- `sortBy`: Sort column (default: postingDate)
- `sortOrder`: Sort direction (asc/desc, default: desc)
- `search`: Search term for filtering

**Response:**
```json
{
  "data": [
    {
      "soldToCustomerNo": "CUST001",
      "invoiceNo": "INV-2024-001",
      "postingDate": "2024-01-15T00:00:00.000Z",
      "customerName": "Example Customer",
      "description": "Product Description",
      "quantity": 10,
      "unitPrice": 100.00,
      "lineAmount": 1000.00
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalCount": 150,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Performance Considerations

### Database Optimization
- Covering indexes on frequently queried columns
- Views pre-aggregate data to reduce computation
- Parameterized queries prevent SQL injection
- Connection pooling via Prisma

### Frontend Optimization
- Lazy loading of chart and table components
- TanStack Query caching with 60-second stale time
- Pagination reduces data transfer
- Debounced search to minimize API calls

### Caching Strategy
- Summary data cached for 30 minutes
- Detail data uses no-cache for real-time accuracy
- Client-side query caching with automatic invalidation

## Security

- NextAuth.js authentication required for all endpoints
- SQL injection protection via Prisma parameterized queries
- Row-Level Security placeholder in database setup
- HTTPS enforcement in production

## Troubleshooting

### Common Issues

1. **No data showing**: 
   - Verify the SQL views are created and contain data
   - Check database connection string
   - Ensure user has SELECT permissions on views

2. **Chart not loading**:
   - ECharts is lazy-loaded; check browser console for errors
   - Verify data format matches expected structure

3. **Slow performance**:
   - Check if covering indexes are created
   - Monitor query execution plans
   - Consider adding more specific indexes based on usage patterns

### Development Tips

- Use React Query DevTools to debug caching issues
- Check Next.js build output for bundle size optimization
- Monitor network tab for API response times
- Use Prisma Studio to verify data structure

## Future Enhancements

- Export functionality (CSV, Excel, PDF)
- Advanced filtering by date ranges, product categories
- Real-time updates via WebSocket connections
- Mobile app integration
- Additional chart types (pie, line, scatter)
- Scheduled reports via email

## Contributing

When adding new features:
1. Follow the existing patterns for API routes and components
2. Add proper TypeScript types
3. Include loading states and error handling
4. Add appropriate caching strategies
5. Update this documentation