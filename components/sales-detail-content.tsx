'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SalesInvoiceDetail } from '@/app/api/sales/[customerNo]/route';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface SalesDetailResponse {
  data: SalesInvoiceDetail[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  sorting: {
    sortBy: string;
    sortOrder: string;
  };
  search: string;
}

async function fetchSalesDetail(
  customerNo: string,
  page: number = 1,
  limit: number = 20,
  sortBy: string = 'postingDate',
  sortOrder: string = 'desc',
  search: string = ''
): Promise<SalesDetailResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
    search,
  });

  const response = await fetch(`/api/sales/${encodeURIComponent(customerNo)}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sales details');
  }
  return response.json();
}

const columns: ColumnDef<SalesInvoiceDetail>[] = [
  {
    accessorKey: 'invoiceNo',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-semibold"
      >
        Invoice No
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('invoiceNo')}</div>
    ),
  },
  {
    accessorKey: 'postingDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-semibold"
      >
        Posting Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('postingDate') as string;
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: 'itemNo',
    header: 'Item No',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('itemNo') || '-'}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.getValue('description')}>
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-semibold"
      >
        Quantity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const quantity = row.getValue('quantity') as number;
      return <div className="text-right">{quantity.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'unitPrice',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-semibold"
      >
        Unit Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue('unitPrice') as number;
      return <div className="text-right">${price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'lineAmount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-semibold"
      >
        Line Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.getValue('lineAmount') as number;
      return <div className="text-right font-medium">${amount.toLocaleString()}</div>;
    },
  },
];

interface Props {
  customerNo: string;
}

export function SalesDetailContent({ customerNo }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'postingDate', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const sortBy = sorting[0]?.id || 'postingDate';
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const { data: salesDetail, isLoading, error } = useQuery({
    queryKey: [
      'sales-detail',
      customerNo,
      pagination.pageIndex + 1,
      pagination.pageSize,
      sortBy,
      sortOrder,
      globalFilter,
    ],
    queryFn: () =>
      fetchSalesDetail(
        customerNo,
        pagination.pageIndex + 1,
        pagination.pageSize,
        sortBy,
        sortOrder,
        globalFilter
      ),
    staleTime: 0, // Always fresh data for detailed views
  });

  const table = useReactTable({
    data: salesDetail?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: salesDetail?.pagination.totalPages || 0,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading sales details. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = salesDetail?.data.reduce((sum, item) => sum + item.lineAmount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesDetail?.pagination.totalCount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Page Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesDetail?.data[0]?.customerName || customerNo}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Line Details</CardTitle>
          <CardDescription>
            Detailed breakdown of all invoice lines for this customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center py-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices, items, descriptions..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                salesDetail?.pagination.totalCount || 0
              )}{' '}
              of {salesDetail?.pagination.totalCount || 0} entries
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}