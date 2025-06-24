'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// Simple date range interface
interface DateRange {
  from?: Date;
  to?: Date;
}

// Filter types
interface SalesFilters {
  freight: string[];
  region: string[];
  channel: string[];
  division: string[];
}

// Mock filter options
const filterOptions = {
  freight: ['Standard', 'Express', 'Overnight', 'Ground'],
  region: ['North', 'South', 'East', 'West', 'Central'],
  channel: ['Direct', 'Distributor', 'Online', 'Retail'],
  division: ['Industrial', 'Agriculture', 'Construction', 'Mining']
};

// Mock data for Overall Performance with drill-down capabilities
const overallData = [
  { 
    name: 'Total Sales YTD', 
    value: 17600000,
    valueFormatted: '$17.6M', 
    percentage: 100, 
    growth: '+15.2%',
    color: '#8884d8',
    isDrillable: true,
    drillType: 'customers' // This will show all customers
  },
  { 
    name: 'Q1 2024', 
    value: 4800000,
    valueFormatted: '$4.8M', 
    percentage: 27.3, 
    growth: '+12.5%',
    color: '#82ca9d',
    isDrillable: true,
    drillType: 'quarter'
  },
  { 
    name: 'Q2 2024', 
    value: 5200000,
    valueFormatted: '$5.2M', 
    percentage: 29.5, 
    growth: '+18.7%',
    color: '#ffc658',
    isDrillable: true,
    drillType: 'quarter'
  },
  { 
    name: 'Q3 2024', 
    value: 4100000,
    valueFormatted: '$4.1M', 
    percentage: 23.3, 
    growth: '+8.9%',
    color: '#ff7300',
    isDrillable: true,
    drillType: 'quarter'
  },
  { 
    name: 'Q4 2024 (Projected)', 
    value: 3500000,
    valueFormatted: '$3.5M', 
    percentage: 19.9, 
    growth: '+22.1%',
    color: '#8dd1e1',
    isDrillable: false,
    drillType: 'quarter'
  }
];

// Mock customer data (what shows when clicking "Total Sales YTD")
const customerData = [
  { 
    name: 'Enterprise Systems', 
    customerNo: 'CUST005',
    value: 5950000,
    valueFormatted: '$5.95M', 
    percentage: 33.8, 
    growth: '+19.1%',
    color: '#8884d8',
    transactions: 256,
    lastOrder: '2024-06-10',
    // Individual customer sales breakdown
    salesBreakdown: [
      { month: 'Jan', sales: 480000, orders: 18 },
      { month: 'Feb', sales: 520000, orders: 22 },
      { month: 'Mar', sales: 610000, orders: 25 },
      { month: 'Apr', sales: 580000, orders: 21 },
      { month: 'May', sales: 750000, orders: 28 },
      { month: 'Jun', sales: 890000, orders: 31 },
      { month: 'Jul', sales: 720000, orders: 26 },
      { month: 'Aug', sales: 640000, orders: 24 },
      { month: 'Sep', sales: 580000, orders: 20 },
      { month: 'Oct', sales: 620000, orders: 23 },
      { month: 'Nov', sales: 550000, orders: 18 }
    ]
  },
  { 
    name: 'Tech Solutions Inc', 
    customerNo: 'CUST003',
    value: 3470000,
    valueFormatted: '$3.47M', 
    percentage: 19.7, 
    growth: '+21.5%',
    color: '#82ca9d',
    transactions: 189,
    lastOrder: '2024-06-08',
    salesBreakdown: [
      { month: 'Jan', sales: 280000, orders: 12 },
      { month: 'Feb', sales: 320000, orders: 15 },
      { month: 'Mar', sales: 380000, orders: 18 },
      { month: 'Apr', sales: 290000, orders: 14 },
      { month: 'May', sales: 420000, orders: 19 },
      { month: 'Jun', sales: 380000, orders: 17 },
      { month: 'Jul', sales: 310000, orders: 14 },
      { month: 'Aug', sales: 350000, orders: 16 },
      { month: 'Sep', sales: 290000, orders: 13 },
      { month: 'Oct', sales: 320000, orders: 15 },
      { month: 'Nov', sales: 250000, orders: 11 }
    ]
  },
  { 
    name: 'Acme Corporation', 
    customerNo: 'CUST001',
    value: 3105000,
    valueFormatted: '$3.11M', 
    percentage: 17.7, 
    growth: '+15.2%',
    color: '#ffc658',
    transactions: 145,
    lastOrder: '2024-06-12',
    salesBreakdown: [
      { month: 'Jan', sales: 250000, orders: 10 },
      { month: 'Feb', sales: 280000, orders: 12 },
      { month: 'Mar', sales: 320000, orders: 14 },
      { month: 'Apr', sales: 290000, orders: 13 },
      { month: 'May', sales: 350000, orders: 15 },
      { month: 'Jun', sales: 380000, orders: 16 },
      { month: 'Jul', sales: 290000, orders: 12 },
      { month: 'Aug', sales: 270000, orders: 11 },
      { month: 'Sep', sales: 240000, orders: 10 },
      { month: 'Oct', sales: 260000, orders: 11 },
      { month: 'Nov', sales: 265000, orders: 11 }
    ]
  },
  { 
    name: 'Global Industries Ltd', 
    customerNo: 'CUST002',
    value: 2260000,
    valueFormatted: '$2.26M', 
    percentage: 12.8, 
    growth: '+12.1%',
    color: '#ff7300',
    transactions: 98,
    lastOrder: '2024-06-05',
    salesBreakdown: [
      { month: 'Jan', sales: 180000, orders: 8 },
      { month: 'Feb', sales: 200000, orders: 9 },
      { month: 'Mar', sales: 220000, orders: 10 },
      { month: 'Apr', sales: 190000, orders: 8 },
      { month: 'May', sales: 240000, orders: 10 },
      { month: 'Jun', sales: 250000, orders: 11 },
      { month: 'Jul', sales: 210000, orders: 9 },
      { month: 'Aug', sales: 200000, orders: 8 },
      { month: 'Sep', sales: 180000, orders: 7 },
      { month: 'Oct', sales: 190000, orders: 8 },
      { month: 'Nov', sales: 200000, orders: 10 }
    ]
  },
  { 
    name: 'Manufacturing Co', 
    customerNo: 'CUST004',
    value: 1770000,
    valueFormatted: '$1.77M', 
    percentage: 10.1, 
    growth: '+8.9%',
    color: '#8dd1e1',
    transactions: 76,
    lastOrder: '2024-06-03',
    salesBreakdown: [
      { month: 'Jan', sales: 140000, orders: 6 },
      { month: 'Feb', sales: 160000, orders: 7 },
      { month: 'Mar', sales: 180000, orders: 8 },
      { month: 'Apr', sales: 150000, orders: 6 },
      { month: 'May', sales: 190000, orders: 8 },
      { month: 'Jun', sales: 200000, orders: 9 },
      { month: 'Jul', sales: 170000, orders: 7 },
      { month: 'Aug', sales: 160000, orders: 6 },
      { month: 'Sep', sales: 140000, orders: 5 },
      { month: 'Oct', sales: 150000, orders: 6 },
      { month: 'Nov', sales: 170000, orders: 8 }
    ]
  },
  { 
    name: 'Small Business LLC', 
    customerNo: 'CUST006',
    value: 1160000,
    valueFormatted: '$1.16M', 
    percentage: 6.6, 
    growth: '+22.1%',
    color: '#d084d0',
    transactions: 52,
    lastOrder: '2024-06-01',
    salesBreakdown: [
      { month: 'Jan', sales: 90000, orders: 4 },
      { month: 'Feb', sales: 100000, orders: 5 },
      { month: 'Mar', sales: 120000, orders: 6 },
      { month: 'Apr', sales: 110000, orders: 5 },
      { month: 'May', sales: 130000, orders: 6 },
      { month: 'Jun', sales: 140000, orders: 7 },
      { month: 'Jul', sales: 120000, orders: 5 },
      { month: 'Aug', sales: 110000, orders: 4 },
      { month: 'Sep', sales: 100000, orders: 4 },
      { month: 'Oct', sales: 105000, orders: 4 },
      { month: 'Nov', sales: 105000, orders: 7 }
    ]
  }
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">
          Sales: {data.valueFormatted}
        </p>
        <p className="text-green-600">
          Growth: {data.growth}
        </p>
        <p className="text-muted-foreground text-sm">
          {data.percentage}% of total sales
        </p>
        {data.isDrillable && (
          <p className="text-xs text-muted-foreground mt-1">
            Click to drill down
          </p>
        )}
      </div>
    );
  }
  return null;
};

function SalesFilters({ 
  filters, 
  onFiltersChange,
  dateRange,
  onDateRangeChange
}: { 
  filters: SalesFilters; 
  onFiltersChange: (filters: SalesFilters) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const handleFilterChange = (category: keyof SalesFilters, value: string, checked: boolean) => {
    const newFilters = { ...filters };
    if (checked) {
      newFilters[category] = [...newFilters[category], value];
    } else {
      newFilters[category] = newFilters[category].filter(item => item !== value);
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      freight: [],
      region: [],
      channel: [],
      division: []
    });
    onDateRangeChange(undefined);
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0) || !!dateRange;

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Picker */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="space-y-2">
            {/* Quick preset buttons - stacked vertically */}
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  onDateRangeChange({ from: today, to: today });
                }}
                className="text-xs"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  onDateRangeChange({ from: firstDay, to: lastDay });
                }}
                className="text-xs"
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), 0, 1);
                  const lastDay = new Date(today.getFullYear(), 11, 31);
                  onDateRangeChange({ from: firstDay, to: lastDay });
                }}
                className="text-xs col-span-2"
              >
                This Year
              </Button>
            </div>
            
            {/* Date inputs - stacked vertically */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-12">From:</Label>
                <input
                  type="date"
                  value={dateRange?.from ? new Date(dateRange.from.getTime() - dateRange.from.getTimezoneOffset() * 60000).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    onDateRangeChange({ from: date, to: dateRange?.to });
                  }}
                  className="flex-1 text-xs border border-input rounded px-2 py-1 bg-background"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-12">To:</Label>
                <input
                  type="date"
                  value={dateRange?.to ? new Date(dateRange.to.getTime() - dateRange.to.getTimezoneOffset() * 60000).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    onDateRangeChange({ from: dateRange?.from, to: date });
                  }}
                  className="flex-1 text-xs border border-input rounded px-2 py-1 bg-background"
                />
              </div>
              {(dateRange?.from || dateRange?.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDateRangeChange(undefined)}
                  className="w-full text-xs"
                >
                  Clear Dates
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Freight Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Freight</Label>
          <div className="space-y-2">
            {filterOptions.freight.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`freight-${option}`}
                  checked={filters.freight.includes(option)}
                  onCheckedChange={(checked) => 
                    handleFilterChange('freight', option, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`freight-${option}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Region Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Region</Label>
          <div className="space-y-2">
            {filterOptions.region.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`region-${option}`}
                  checked={filters.region.includes(option)}
                  onCheckedChange={(checked) => 
                    handleFilterChange('region', option, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`region-${option}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Channel Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Channel</Label>
          <div className="space-y-2">
            {filterOptions.channel.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`channel-${option}`}
                  checked={filters.channel.includes(option)}
                  onCheckedChange={(checked) => 
                    handleFilterChange('channel', option, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`channel-${option}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Division Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Division</Label>
          <div className="space-y-2">
            {filterOptions.division.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`division-${option}`}
                  checked={filters.division.includes(option)}
                  onCheckedChange={(checked) => 
                    handleFilterChange('division', option, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`division-${option}`} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesOverallContent() {
  const router = useRouter();
  const [filters, setFilters] = useState<SalesFilters>({
    freight: [],
    region: [],
    channel: [],
    division: []
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // State for managing drill-down levels
  const [drillLevel, setDrillLevel] = useState<'overview' | 'customers' | 'customer-detail'>('overview');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Handle clicking on overview items (like "Total Sales YTD")
  const handleOverviewClick = (data: any) => {
    if (data.isDrillable && data.drillType === 'customers') {
      setSelectedItem(data);
      setDrillLevel('customers');
    } else if (data.isDrillable) {
      console.log(`Clicked ${data.name} - could show quarterly breakdown`);
    }
  };

  // Handle clicking on a customer (shows individual customer detail)
  const handleCustomerClick = (customer: any) => {
    setSelectedCustomer(customer);
    setDrillLevel('customer-detail');
    // Or navigate to existing customer detail page
    // router.push(`/sales/${customer.customerNo}`);
  };

  // Navigation functions
  const handleBackToOverview = () => {
    setDrillLevel('overview');
    setSelectedItem(null);
    setSelectedCustomer(null);
  };

  const handleBackToCustomers = () => {
    setDrillLevel('customers');
    setSelectedCustomer(null);
  };

  return (
    <div className="flex gap-6">
      {/* Filters Panel */}
      <div className="flex-shrink-0">
        <SalesFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        
        {/* LEVEL 1: Overview */}
        {drillLevel === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📊 Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overallData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      onClick={handleOverviewClick}
                      cursor="pointer"
                    >
                      {overallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LEVEL 2: All Customers */}
        {drillLevel === 'customers' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  👥 {selectedItem?.name} - All Customers
                </CardTitle>
                <Button variant="outline" onClick={handleBackToOverview}>
                  ← Back to Overview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{selectedItem?.valueFormatted}</div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedItem?.growth}</div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{customerData.length}</div>
                    <div className="text-sm text-muted-foreground">Active Customers</div>
                  </div>
                </div>

                {/* Customer Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={customerData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={10}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        fontSize={11}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`$${(value / 1000000).toFixed(2)}M`, 'Sales']}
                      />
                      <Bar 
                        dataKey="value" 
                        onClick={(data) => handleCustomerClick(data)}
                        cursor="pointer"
                      >
                        {customerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Customer List */}
                <div className="space-y-2">
                  {customerData.map((customer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.customerNo}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{customer.valueFormatted}</div>
                            <div className="text-sm text-green-600">{customer.growth}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span>{customer.transactions} transactions • Last order: {customer.lastOrder}</span>
                          <span className="font-medium">{customer.percentage}% of total</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LEVEL 3: Individual Customer Detail */}
        {drillLevel === 'customer-detail' && selectedCustomer && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  🏢 {selectedCustomer.name} - Monthly Sales Breakdown
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToCustomers}>
                    ← Back to Customers
                  </Button>
                  <Button variant="outline" onClick={handleBackToOverview}>
                    ← Back to Overview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Customer Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{selectedCustomer.valueFormatted}</div>
                    <div className="text-sm text-muted-foreground">YTD Sales</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedCustomer.growth}</div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{selectedCustomer.transactions}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{selectedCustomer.lastOrder}</div>
                    <div className="text-sm text-muted-foreground">Last Order</div>
                  </div>
                </div>

                {/* Monthly Sales Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedCustomer.salesBreakdown}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        fontSize={11}
                      />
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          `$${(value / 1000).toFixed(0)}K`,
                          name === 'sales' ? 'Sales' : 'Orders'
                        ]}
                      />
                      <Bar dataKey="sales" fill={selectedCustomer.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedCustomer.salesBreakdown.map((month: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => {
                        // Could drill down to individual invoices for this month
                        console.log(`Clicked ${selectedCustomer.name} - ${month.month}: $${(month.sales/1000).toFixed(0)}K`);
                      }}
                    >
                      <div className="font-semibold">{month.month}</div>
                      <div className="text-lg font-bold">${(month.sales / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-muted-foreground">{month.orders} orders</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}