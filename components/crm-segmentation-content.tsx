"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconUsers, IconFilter, IconDownload, IconTargetArrow } from "@tabler/icons-react"
import { DataTable } from "@/components/data-table"

interface AccountSegment {
  id: string
  name: string
  accountNumber: string
  revenue: number
  segment: string
  industry: string
  lastContact: string
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'inactive' | 'prospect'
}

export function CrmSegmentationContent() {
  const [accounts, setAccounts] = useState<AccountSegment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<string>("all")
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all")

  useEffect(() => {
    // Mock segmented account data
    setAccounts([
      {
        id: "1",
        name: "Acme Corporation",
        accountNumber: "ACC001",
        revenue: 450000,
        segment: "Enterprise",
        industry: "Construction",
        lastContact: "2024-06-10",
        priority: "high",
        status: "active"
      },
      {
        id: "2",
        name: "Beta Industries", 
        accountNumber: "ACC002",
        revenue: 125000,
        segment: "Mid-Market",
        industry: "Transportation",
        lastContact: "2024-06-08",
        priority: "medium",
        status: "active"
      },
      {
        id: "3",
        name: "Gamma Solutions",
        accountNumber: "ACC003", 
        revenue: 75000,
        segment: "Small Business",
        industry: "Mining",
        lastContact: "2024-05-25",
        priority: "medium",
        status: "prospect"
      },
      {
        id: "4",
        name: "Delta Corp",
        accountNumber: "ACC004",
        revenue: 850000,
        segment: "Enterprise",
        industry: "Oil & Gas",
        lastContact: "2024-06-12",
        priority: "high", 
        status: "active"
      }
    ])
  }, [])

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800'
      case 'Mid-Market': return 'bg-blue-100 text-blue-800'
      case 'Small Business': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'prospect': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAccounts = accounts.filter(account => {
    if (selectedSegment !== "all" && account.segment !== selectedSegment) return false
    if (selectedIndustry !== "all" && account.industry !== selectedIndustry) return false
    return true
  })

  const segmentStats = {
    Enterprise: accounts.filter(a => a.segment === 'Enterprise').length,
    'Mid-Market': accounts.filter(a => a.segment === 'Mid-Market').length,
    'Small Business': accounts.filter(a => a.segment === 'Small Business').length
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Account Name",
    },
    {
      accessorKey: "accountNumber",
      header: "Account #",
    },
    {
      accessorKey: "segment", 
      header: "Segment",
      cell: ({ row }: any) => (
        <Badge className={getSegmentColor(row.getValue("segment"))}>
          {row.getValue("segment")}
        </Badge>
      ),
    },
    {
      accessorKey: "industry",
      header: "Industry",
    },
    {
      accessorKey: "revenue",
      header: "Annual Revenue",
      cell: ({ row }: any) => {
        const amount = parseFloat(row.getValue("revenue"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "CAD",
        }).format(amount)
        return formatted
      },
    },
    {
      accessorKey: "status",
      header: "Status", 
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "lastContact",
      header: "Last Contact",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <IconTargetArrow className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentStats.Enterprise}</div>
            <p className="text-xs text-muted-foreground">High-value accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mid-Market</CardTitle>
            <IconUsers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentStats['Mid-Market']}</div>
            <p className="text-xs text-muted-foreground">Growing businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Small Business</CardTitle>
            <IconUsers className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentStats['Small Business']}</div>
            <p className="text-xs text-muted-foreground">Local customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconTargetArrow className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "CAD",
                notation: "compact"
              }).format(accounts.reduce((sum, acc) => sum + acc.revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Annual value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Account Segmentation
          </CardTitle>
          <CardDescription>
            Filter and analyze customer accounts by segment and industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Segment:</label>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Mid-Market">Mid-Market</SelectItem>
                  <SelectItem value="Small Business">Small Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Industry:</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Mining">Mining</SelectItem>
                  <SelectItem value="Oil & Gas">Oil & Gas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="ml-auto">
              <IconDownload className="h-4 w-4 mr-2" />
              Export Segment
            </Button>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredAccounts}
            searchKey="name"
          />
        </CardContent>
      </Card>
    </div>
  )
}