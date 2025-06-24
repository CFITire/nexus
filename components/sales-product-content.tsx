'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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

// Mock data for Product Segment Performance
const productData = [
  { name: 'Heavy Duty Tires', value: '$6.8M', percentage: 38.6, growth: '+14.2%' },
  { name: 'Agricultural Tires', value: '$4.2M', percentage: 23.9, growth: '+21.5%' },
  { name: 'Construction Tires', value: '$3.1M', percentage: 17.6, growth: '+9.8%' },
  { name: 'Industrial Tires', value: '$2.3M', percentage: 13.1, growth: '+18.7%' },
  { name: 'Accessories & Parts', value: '$1.2M', percentage: 6.8, growth: '+28.4%' }
];

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

export function SalesProductContent() {
  const [filters, setFilters] = useState<SalesFilters>({
    freight: [],
    region: [],
    channel: [],
    division: []
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🏭 Sales by Product Segment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => {
                    console.log(`Clicked Product: ${item.name}`);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-lg">{item.name}</div>
                      <div className="text-right">
                        <div className="font-bold text-xl">{item.value}</div>
                        <div className="text-sm text-green-600">{item.growth}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">% of Total</span>
                      <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}