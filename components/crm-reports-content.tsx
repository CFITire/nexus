"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { IconChartBar, IconDownload, IconCalendar, IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react"
import { DateRangePicker } from "@/components/date-range-picker"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"

interface ReportData {
  month: string
  revenue: number
  accounts: number
  opportunities: number
  conversion: number
}

interface SegmentData {
  segment: string
  value: number
  color: string
}

export function CrmReportsContent() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [segmentData, setSegmentData] = useState<SegmentData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>("6months")
  const [selectedReport, setSelectedReport] = useState<string>("revenue")

  useEffect(() => {
    // Mock report data
    setReportData([
      { month: "Jan", revenue: 850000, accounts: 15, opportunities: 25, conversion: 60 },
      { month: "Feb", revenue: 920000, accounts: 18, opportunities: 30, conversion: 60 },
      { month: "Mar", revenue: 1100000, accounts: 22, opportunities: 35, conversion: 63 },
      { month: "Apr", revenue: 980000, accounts: 20, opportunities: 32, conversion: 63 },
      { month: "May", revenue: 1250000, accounts: 25, opportunities: 40, conversion: 63 },
      { month: "Jun", revenue: 1350000, accounts: 28, opportunities: 45, conversion: 62 }
    ])

    setSegmentData([
      { segment: "Enterprise", value: 2100000, color: "#8b5cf6" },
      { segment: "Mid-Market", value: 1450000, color: "#3b82f6" },
      { segment: "Small Business", value: 950000, color: "#10b981" }
    ])
  }, [])

  const totalRevenue = reportData.reduce((sum, item) => sum + item.revenue, 0)
  const avgConversion = reportData.reduce((sum, item) => sum + item.conversion, 0) / reportData.length
  const totalAccounts = reportData.reduce((sum, item) => sum + item.accounts, 0)
  
  const currentMonth = reportData[reportData.length - 1]
  const previousMonth = reportData[reportData.length - 2]
  
  const revenueChange = currentMonth && previousMonth 
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
    : 0

  const getTrendIcon = (change: number) => {
    if (change > 0) return <IconTrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <IconTrendingDown className="h-4 w-4 text-red-600" />
    return <IconMinus className="h-4 w-4 text-gray-600" />
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CAD",
      notation: "compact"
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <DateRangePicker />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <IconCalendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconChartBar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(revenueChange)}
              <span className="ml-1">
                {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Accounts</CardTitle>
            <IconChartBar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground">
              {(totalAccounts / reportData.length).toFixed(1)} avg per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconChartBar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <IconChartBar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(3250000)}</div>
            <p className="text-xs text-muted-foreground">
              Active opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Segment</CardTitle>
            <CardDescription>Distribution across customer segments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                >
                  {(segmentData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Acquisition</CardTitle>
            <CardDescription>New accounts added monthly</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="accounts" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics Summary</CardTitle>
            <CardDescription>Performance indicators for this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Revenue Growth</span>
              <Badge className={revenueChange >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Customer Acquisition Cost</span>
              <span className="font-medium">$2,340</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Customer Lifetime Value</span>
              <span className="font-medium">$45,600</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sales Cycle Length</span>
              <span className="font-medium">32 days</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Win Rate</span>
              <Badge className="bg-blue-100 text-blue-800">
                {avgConversion.toFixed(1)}%
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Top Performing Territories</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Northern Alberta</span>
                  <span className="font-medium">93.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Southern Alberta</span>
                  <span className="font-medium">84.6%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Calgary Metro</span>
                  <span className="font-medium">83.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}