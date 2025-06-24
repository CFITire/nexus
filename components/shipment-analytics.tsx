'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  DollarSign,
  Package
} from 'lucide-react'

interface AnalyticsData {
  totalShipments: number
  onTimeDeliveries: number
  lateDeliveries: number
  onTimePercentage: number
  averageDeliveryTime: number
  totalValue: number
  totalWeight: number
  carrierPerformance: Array<{
    carrier: string
    onTimePercentage: number
    totalShipments: number
  }>
  monthlyTrends: Array<{
    month: string
    onTimePercentage: number
    totalShipments: number
  }>
}

interface ShipmentAnalyticsProps {
  data: AnalyticsData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ShipmentAnalytics({ data }: ShipmentAnalyticsProps) {
  // Add defensive checks for undefined data
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  const onTimeRate = data.onTimePercentage || 0
  const isGoodPerformance = onTimeRate >= 95

  const pieData = [
    { name: 'On Time', value: data.onTimeDeliveries || 0, color: '#10B981' },
    { name: 'Late', value: data.lateDeliveries || 0, color: '#EF4444' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Delivery Analytics</h3>
        <Badge variant={isGoodPerformance ? "default" : "destructive"}>
          {onTimeRate.toFixed(1)}% On-Time Rate
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.totalShipments || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Deliveries</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.onTimeDeliveries || 0}</div>
            <div className="flex items-center space-x-2">
              <Progress value={onTimeRate} className="flex-1" />
              <span className="text-xs text-muted-foreground">{onTimeRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Deliveries</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.lateDeliveries || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(((data.lateDeliveries || 0) / (data.totalShipments || 1)) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageDeliveryTime || 0}</div>
            <p className="text-xs text-muted-foreground">
              days average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly On-Time Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[90, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'On-Time Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="onTimePercentage" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Delivery Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Delivery Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Carrier Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Carrier Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.carrierPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carrier" />
              <YAxis domain={[80, 100]} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'onTimePercentage' ? `${value.toFixed(1)}%` : value,
                  name === 'onTimePercentage' ? 'On-Time Rate' : 'Total Shipments'
                ]}
              />
              <Bar dataKey="onTimePercentage" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {(data.carrierPerformance || []).map((carrier, index) => (
              <div key={carrier.carrier} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{carrier.carrier}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {carrier.totalShipments} shipments
                  </div>
                  <Badge variant={carrier.onTimePercentage >= 95 ? "default" : "secondary"}>
                    {carrier.onTimePercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipment Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(data.totalValue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all shipments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight Shipped</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.totalWeight || 0).toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">
              Total freight weight
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}