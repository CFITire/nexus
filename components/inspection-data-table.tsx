"use client"

import * as React from "react"
import { z } from "zod"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconRefresh,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const inspectionSchema = z.object({
  No: z.string(),
  Inspection_Date: z.string(),
  Inspector_Name: z.string(),
  Sales_Order_No: z.string().optional(),
  Customer_No: z.string().optional(),
  Customer_Name: z.string().optional(),
  Status: z.string().optional(),
  Location_Code: z.string().optional(),
  Inspection_Type: z.string().optional(),
  Inspection_Category: z.string().optional(),
})

type InspectionData = z.infer<typeof inspectionSchema>

const columns: ColumnDef<InspectionData>[] = [
  {
    accessorKey: "No",
    header: "Inspection No",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("No")}
      </div>
    ),
  },
  {
    accessorKey: "Inspection_Date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("Inspection_Date") as string
      return (
        <div className="text-sm">
          {new Date(date).toLocaleDateString()}
        </div>
      )
    },
  },
  {
    accessorKey: "Inspector_Name",
    header: "Inspector",
    cell: ({ row }) => {
      const value = row.getValue("Inspector_Name") as string
      return (
        <div className="text-sm">
          {value || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "Inspection_Type",
    header: "Type",
    cell: ({ row }) => {
      const value = row.getValue("Inspection_Type") as string
      return value ? (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      )
    },
  },
  {
    accessorKey: "Sales_Order_No",
    header: "Sales Order",
    cell: ({ row }) => {
      const value = row.getValue("Sales_Order_No") as string
      return value ? (
        <div className="text-sm">
          {value}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      )
    },
  },
  {
    accessorKey: "Customer_Name",
    header: "Customer",
    cell: ({ row }) => {
      const value = row.getValue("Customer_Name") as string
      return value ? (
        <div className="text-sm">
          {value}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      )
    },
  },
  {
    accessorKey: "Location_Code",
    header: "Location",
    cell: ({ row }) => {
      const value = row.getValue("Location_Code") as string
      return value ? (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      )
    },
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("Status") as string
      const statusColors = {
        Open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        Completed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        Approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
        Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        Cancelled: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      }
      
      return (
        <Badge 
          variant="outline" 
          className={`text-xs ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}
        >
          {status || "Unknown"}
        </Badge>
      )
    },
  },
]

interface InspectionDataTableProps {
  data?: InspectionData[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function InspectionDataTable({ 
  data = [], 
  isLoading = false,
  onRefresh 
}: InspectionDataTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter inspections..."
            value={(table.getColumn("No")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("No")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <IconRefresh className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns />
              <span className="hidden lg:inline">Columns</span>
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace(/([A-Z])/g, ' $1').trim()}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <IconRefresh className="animate-spin size-4" />
                    Loading inspections...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No inspections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="text-muted-foreground text-sm">
          Showing {table.getRowModel().rows.length} of {data.length} inspection(s)
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}