'use client';

import { useState } from 'react';
import { useQuery, dehydrate, QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SalesSummaryItem } from '@/app/api/sales/summary/route';

// Simple date range interface
interface DateRange {
  from?: Date;
  to?: Date;
}

// Lazy load ECharts to reduce bundle size
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false,
});

// Filter types
interface SalesFilters {
  freight: string[];
  region: string[];
  channel: string[];
  division: string[];
}

// Mock filter options - in real app these would come from API
const filterOptions = {
  freight: ['Standard', 'Express', 'Overnight', 'Ground'],
  region: ['North', 'South', 'East', 'West', 'Central'],
  channel: ['Direct', 'Distributor', 'Online', 'Retail'],
  division: ['Industrial', 'Agriculture', 'Construction', 'Mining']
};

async function fetchSalesSummary(): Promise<SalesSummaryItem[]> {
  const response = await fetch('/api/sales/summary');
  if (!response.ok) {
    throw new Error('Failed to fetch sales summary');
  }
  return response.json();
}

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

export function SalesSummaryContent() {
  const router = useRouter();
  
  const [filters, setFilters] = useState<SalesFilters>({
    freight: [],
    region: [],
    channel: [],
    division: []
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: fetchSalesSummary,
    staleTime: 60 * 1000, // 60 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading sales data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!salesData || salesData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No sales data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals first
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalTransactions = salesData.reduce((sum, item) => sum + item.transactionCount, 0);
  const uniqueCustomers = [...new Set(salesData.map(item => item.customerNo))].length;

  // Mock data for different dimensions - in real app this would come from API with proper groupings
  const mockDimensionData = {
    overall: [
      { name: 'Total Sales YTD', value: '$17.6M', percentage: 100, growth: '+15.2%' },
      { name: 'Q1 2024', value: '$4.8M', percentage: 27.3, growth: '+12.5%' },
      { name: 'Q2 2024', value: '$5.2M', percentage: 29.5, growth: '+18.7%' },
      { name: 'Q3 2024', value: '$4.1M', percentage: 23.3, growth: '+8.9%' },
      { name: 'Q4 2024 (Projected)', value: '$3.5M', percentage: 19.9, growth: '+22.1%' }
    ],
    channel: [
      { name: 'Direct Sales', value: '$8.2M', percentage: 46.6, growth: '+18.3%' },
      { name: 'Distributor Network', value: '$5.1M', percentage: 29.0, growth: '+12.1%' },
      { name: 'Online/E-commerce', value: '$2.8M', percentage: 15.9, growth: '+35.7%' },
      { name: 'Retail Partners', value: '$1.5M', percentage: 8.5, growth: '+8.2%' }
    ],
    productSegment: [
      { name: 'Heavy Duty Tires', value: '$6.8M', percentage: 38.6, growth: '+14.2%' },
      { name: 'Agricultural Tires', value: '$4.2M', percentage: 23.9, growth: '+21.5%' },
      { name: 'Construction Tires', value: '$3.1M', percentage: 17.6, growth: '+9.8%' },
      { name: 'Industrial Tires', value: '$2.3M', percentage: 13.1, growth: '+18.7%' },
      { name: 'Accessories & Parts', value: '$1.2M', percentage: 6.8, growth: '+28.4%' }
    ],
    region: [
      { name: 'North Region', value: '$5.8M', percentage: 33.0, growth: '+16.8%' },
      { name: 'Central Region', value: '$4.2M', percentage: 23.9, growth: '+13.2%' },
      { name: 'South Region', value: '$3.9M', percentage: 22.2, growth: '+18.9%' },
      { name: 'West Region', value: '$2.4M', percentage: 13.6, growth: '+11.5%' },
      { name: 'East Region', value: '$1.3M', percentage: 7.4, growth: '+22.7%' }
    ],
    segment: [
      { name: 'Enterprise Customers', value: '$9.2M', percentage: 52.3, growth: '+19.1%' },
      { name: 'Mid-Market', value: '$4.8M', percentage: 27.3, growth: '+12.8%' },
      { name: 'Small Business', value: '$2.1M', percentage: 11.9, growth: '+25.6%' },
      { name: 'Government/Municipal', value: '$1.5M', percentage: 8.5, growth: '+8.7%' }
    ],
    brand: [
      { name: 'CFI Premium', value: '$7.1M', percentage: 40.3, growth: '+22.4%' },
      { name: 'CFI Standard', value: '$4.8M', percentage: 27.3, growth: '+11.9%' },
      { name: 'CFI Industrial', value: '$3.2M', percentage: 18.2, growth: '+15.7%' },
      { name: 'CFI Agricultural', value: '$1.9M', percentage: 10.8, growth: '+18.3%' },
      { name: 'Private Label', value: '$0.6M', percentage: 3.4, growth: '+5.2%' }
    ],
    salesman: [
      { name: 'John Mitchell', value: '$3.8M', percentage: 21.6, growth: '+24.1%' },
      { name: 'Sarah Johnson', value: '$2.9M', percentage: 16.5, growth: '+18.7%' },
      { name: 'Mike Rodriguez', value: '$2.4M', percentage: 13.6, growth: '+15.3%' },
      { name: 'Lisa Chen', value: '$2.1M', percentage: 11.9, growth: '+22.8%' },
      { name: 'David Thompson', value: '$1.8M', percentage: 10.2, growth: '+12.5%' },
      { name: 'Others (8 reps)', value: '$4.6M', percentage: 26.1, growth: '+14.9%' }
    ]
  };

  // Component for rendering a dimension block
  const DimensionBlock = ({ title, data, icon }: { title: string; data: any[]; icon?: string }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => {
                // In real app, this would drill down to filtered view
                console.log(`Clicked ${title}: ${item.name}`);
              }}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-right">
                    <div className="font-bold">{item.value}</div>
                    <div className="text-xs text-green-600">{item.growth}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">% of Total</span>
                  <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
        {/* Overall Performance Block */}
        <DimensionBlock title="📊 Overall Performance" data={mockDimensionData.overall} />

        {/* Two Column Grid for Main Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DimensionBlock title="📢 Sales by Channel" data={mockDimensionData.channel} />
          <DimensionBlock title="🏭 Sales by Product Segment" data={mockDimensionData.productSegment} />
        </div>

        {/* Two Column Grid for Geographic and Customer Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DimensionBlock title="🌍 Sales by Region" data={mockDimensionData.region} />
          <DimensionBlock title="🎯 Sales by Customer Segment" data={mockDimensionData.segment} />
        </div>

        {/* Two Column Grid for Brand and Sales Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DimensionBlock title="🏷️ Sales by Brand" data={mockDimensionData.brand} />
          <DimensionBlock title="👥 Sales by Salesman" data={mockDimensionData.salesman} />
        </div>
      </div>
    </div>
  );
}