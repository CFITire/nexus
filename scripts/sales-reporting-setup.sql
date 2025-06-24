-- Sales Reporting Module - SQL Views and Indexes
-- Azure SQL Database Setup Script
-- Run this script against your Azure SQL Database where Customer Ledger Entries are replicated

-- Create view for sales summary by customer and fiscal year
IF OBJECT_ID('vw_SalesByCustomerYear', 'V') IS NOT NULL
    DROP VIEW vw_SalesByCustomerYear;
GO

CREATE VIEW vw_SalesByCustomerYear AS
SELECT 
    SoldToCustomerNo,
    YEAR(PostingDate) AS FiscalYear,
    SUM(Amount) AS Sales,
    COUNT(*) AS TransactionCount
FROM CustomerLedgerEntries
WHERE 
    PostingDate >= DATEADD(year, -3, GETDATE())
    AND EntryType = 'Sale'
    AND Amount > 0
GROUP BY 
    SoldToCustomerNo, 
    YEAR(PostingDate);
GO

-- Create view for sales invoice details by customer
IF OBJECT_ID('vw_SalesInvoicesByCustomer', 'V') IS NOT NULL
    DROP VIEW vw_SalesInvoicesByCustomer;
GO

CREATE VIEW vw_SalesInvoicesByCustomer AS
SELECT 
    h.SoldToCustomerNo,
    h.DocumentNo AS InvoiceNo,
    h.PostingDate,
    h.OrderDate,
    h.CustomerName,
    l.Type AS LineType,
    l.ItemNo,
    l.Description,
    l.Quantity,
    l.UnitPrice,
    l.LineAmount,
    l.VATAmount,
    l.AmountIncludingVAT,
    h.CurrencyCode,
    h.ExchangeRate
FROM SalesInvoiceHeaders h
INNER JOIN SalesInvoiceLines l ON h.DocumentNo = l.DocumentNo
WHERE 
    h.PostingDate >= DATEADD(year, -3, GETDATE())
    AND l.LineAmount > 0;
GO

-- Create covering indexes for performance
-- Index on Customer Ledger Entries for the summary view
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CustomerLedgerEntries_SoldTo_PostingDate_Covering')
BEGIN
    CREATE NONCLUSTERED INDEX IX_CustomerLedgerEntries_SoldTo_PostingDate_Covering
    ON CustomerLedgerEntries (SoldToCustomerNo, PostingDate)
    INCLUDE (Amount, EntryType);
END
GO

-- Index on Sales Invoice Headers
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SalesInvoiceHeaders_SoldTo_PostingDate_Covering')
BEGIN
    CREATE NONCLUSTERED INDEX IX_SalesInvoiceHeaders_SoldTo_PostingDate_Covering
    ON SalesInvoiceHeaders (SoldToCustomerNo, PostingDate)
    INCLUDE (DocumentNo, OrderDate, CustomerName, CurrencyCode, ExchangeRate);
END
GO

-- Index on Sales Invoice Lines
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SalesInvoiceLines_DocumentNo_Covering')
BEGIN
    CREATE NONCLUSTERED INDEX IX_SalesInvoiceLines_DocumentNo_Covering
    ON SalesInvoiceLines (DocumentNo)
    INCLUDE (Type, ItemNo, Description, Quantity, UnitPrice, LineAmount, VATAmount, AmountIncludingVAT);
END
GO

-- Enable Row-Level Security (RLS) for sold-to customer restrictions
-- This is a placeholder - actual RLS policy would depend on your authentication/authorization model
-- ALTER TABLE CustomerLedgerEntries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE SalesInvoiceHeaders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE SalesInvoiceLines ENABLE ROW LEVEL SECURITY;

-- Example RLS policy (customize based on your user context)
-- CREATE SECURITY POLICY SalesDataAccessPolicy
-- ADD FILTER PREDICATE dbo.fn_securitypredicate_sales(SoldToCustomerNo) ON CustomerLedgerEntries,
-- ADD FILTER PREDICATE dbo.fn_securitypredicate_sales(SoldToCustomerNo) ON SalesInvoiceHeaders;

-- Grant permissions to application service account
-- GRANT SELECT ON vw_SalesByCustomerYear TO [YourAppServiceAccount];
-- GRANT SELECT ON vw_SalesInvoicesByCustomer TO [YourAppServiceAccount];

PRINT 'Sales reporting views and indexes created successfully';