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
  Cell
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

// Mock data for Channel Performance - formatted for Recharts
const channelData = [
  { 
    name: 'Direct Sales', 
    value: 8200000, 
    valueFormatted: '$8.2M', 
    percentage: 46.6, 
    growth: '+18.3%',
    color: '#8884d8',
    drillDownData: [
      { name: 'Enterprise Direct', value: 4800000, percentage: 58.5 },
      { name: 'Mid-Market Direct', value: 2200000, percentage: 26.8 },
      { name: 'Small Business Direct', value: 1200000, percentage: 14.6 }
    ]
  },
  { 
    name: 'Distributor Network', 
    value: 5100000, 
    valueFormatted: '$5.1M', 
    percentage: 29.0, 
    growth: '+12.1%',
    color: '#82ca9d',
    drillDownData: [
      { name: 'Regional Distributors', value: 3200000, percentage: 62.7 },
      { name: 'National Distributors', value: 1500000, percentage: 29.4 },
      { name: 'Specialty Distributors', value: 400000, percentage: 7.8 }
    ]
  },
  { 
    name: 'Online/E-commerce', 
    value: 2800000, 
    valueFormatted: '$2.8M', 
    percentage: 15.9, 
    growth: '+35.7%',
    color: '#ffc658',
    drillDownData: [
      { name: 'Company Website', value: 1800000, percentage: 64.3 },
      { name: 'Amazon/eBay', value: 700000, percentage: 25.0 },
      { name: 'B2B Marketplace', value: 300000, percentage: 10.7 }
    ]
  },
  { 
    name: 'Retail Partners', 
    value: 1500000, 
    valueFormatted: '$1.5M', 
    percentage: 8.5, 
    growth: '+8.2%',
    color: '#ff7300',
    drillDownData: [
      { name: 'Auto Parts Stores', value: 900000, percentage: 60.0 },
      { name: 'Farm Supply Stores', value: 400000, percentage: 26.7 },
      { name: 'Equipment Dealers', value: 200000, percentage: 13.3 }
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
        <p className="text-xs text-muted-foreground mt-1">
          Click to drill down
        </p>
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

export function SalesChannelContent() {
  const router = useRouter();
  const [filters, setFilters] = useState<SalesFilters>({
    freight: [],
    region: [],
    channel: [],
    division: []
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [drillDownData, setDrillDownData] = useState<any[]>([]);

  // Handle bar click for drill-down
  const handleBarClick = (data: any) => {
    if (data && data.drillDownData) {
      setSelectedChannel(data);
      setDrillDownData(data.drillDownData);
    }
  };

  // Handle drill-down item click (could navigate to detailed view)
  const handleDrillDownClick = (data: any) => {
    // Example: Navigate to customer detail page with filters
    // router.push(`/sales/customers?channel=${selectedChannel.name}&subChannel=${data.name}`);
    console.log(`Drill-down clicked: ${selectedChannel.name} -> ${data.name}`);
  };

  // Reset to main view
  const handleBackToMain = () => {
    setSelectedChannel(null);
    setDrillDownData([]);
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
        {/* Main Chart */}
        {!selectedChannel && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📢 Sales by Channel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={channelData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      onClick={handleBarClick}
                      cursor="pointer"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drill-down View */}
        {selectedChannel && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  📢 {selectedChannel.name} - Breakdown
                </CardTitle>
                <Button variant="outline" onClick={handleBackToMain}>
                  ← Back to Channels
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{selectedChannel.valueFormatted}</div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedChannel.growth}</div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{selectedChannel.percentage}%</div>
                    <div className="text-sm text-muted-foreground">of Total Sales</div>
                  </div>
                </div>

                {/* Drill-down Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={drillDownData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={11}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                        fontSize={11}
                      />
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          `$${(value / 1000000).toFixed(2)}M`,
                          'Sales'
                        ]}
                      />
                      <Bar 
                        dataKey="value" 
                        fill={selectedChannel.color}
                        onClick={handleDrillDownClick}
                        cursor="pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Drill-down Details */}
                <div className="space-y-2">
                  {drillDownData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleDrillDownClick(item)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold">${(item.value / 1000000).toFixed(2)}M</div>
                          <div className="text-xs text-muted-foreground">{item.percentage}% of {selectedChannel.name}</div>
                        </div>
                      </div>
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