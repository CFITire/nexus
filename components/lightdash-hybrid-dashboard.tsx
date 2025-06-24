'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Filter, RefreshCw } from 'lucide-react';
import { LightdashDashboard, LightdashChart } from './lightdash-dashboard';
import { lightdashUtils } from '@/lib/lightdash';

// Hybrid dashboard that combines embedded charts with custom filters and summary cards
export function LightdashHybridDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Simulate fetching summary data from Lightdash API
  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // In real implementation, this would use the Lightdash API
      // const result = await lightdash.runSavedChartQuery('summary-metrics-uuid');
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData({
        totalSales: '$17.6M',
        growth: '+15.2%',
        customers: 156,
        avgOrderValue: '$12,847'
      });
    } catch (error) {
      console.error('Failed to fetch summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [activeFilters]);

  const handleFilterChange = (filterKey: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground">
            Powered by Lightdash • Real-time business intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchSummaryData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {Object.keys(activeFilters).length > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary">
              {key}: {String(value)}
            </Badge>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : dashboardData ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Sales</div>
                <div className="text-2xl font-bold">{dashboardData.totalSales}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">Growth Rate</div>
                <div className="text-2xl font-bold text-green-600">{dashboardData.growth}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">Active Customers</div>
                <div className="text-2xl font-bold">{dashboardData.customers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm font-medium text-muted-foreground">Avg Order Value</div>
                <div className="text-2xl font-bold">{dashboardData.avgOrderValue}</div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LightdashChart
              chartUrl={lightdashUtils.getSalesChartUrl('overview')}
              title="Sales Trend"
              height="350px"
            />
            <LightdashChart
              chartUrl={lightdashUtils.getSalesChartUrl('channel')}
              title="Sales by Channel"
              height="350px"
            />
          </div>
          <div className="mt-6">
            <LightdashDashboard
              dashboardUrl={lightdashUtils.getSalesOverviewUrl(activeFilters)}
              title="Detailed Overview Dashboard"
              height="600px"
            />
          </div>
        </TabsContent>

        <TabsContent value="channels">
          <LightdashDashboard
            dashboardUrl={lightdashUtils.getChannelAnalysisUrl(activeFilters)}
            title="Channel Performance Analysis"
            height="70vh"
          />
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LightdashChart
              chartUrl={lightdashUtils.getSalesChartUrl('product')}
              title="Product Performance"
              height="400px"
            />
            <LightdashChart
              chartUrl="https://your-lightdash-instance.com/projects/your-project/saved/product-margin-chart"
              title="Product Margins"
              height="400px"
            />
          </div>
        </TabsContent>

        <TabsContent value="regions">
          <LightdashChart
            chartUrl={lightdashUtils.getSalesChartUrl('region')}
            title="Regional Sales Distribution"
            height="500px"
          />
        </TabsContent>

        <TabsContent value="customers">
          <LightdashDashboard
            dashboardUrl={lightdashUtils.getCustomerAnalysisUrl()}
            title="Customer Analysis Dashboard"
            height="70vh"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Quick setup component for testing
export function LightdashQuickSetup() {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Connect to Lightdash",
      description: "Set up your Lightdash instance connection",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Environment Variables Needed:</h4>
            <code className="text-sm">
              NEXT_PUBLIC_LIGHTDASH_URL=https://your-instance.lightdash.com<br/>
              NEXT_PUBLIC_LIGHTDASH_PROJECT_ID=your-project-id<br/>
              LIGHTDASH_API_KEY=your-api-key
            </code>
          </div>
        </div>
      )
    },
    {
      title: "Create Dashboards",
      description: "Set up your sales dashboards in Lightdash",
      content: (
        <div className="space-y-4">
          <p>Create these dashboards in your Lightdash instance:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Sales Overview Dashboard</li>
            <li>Channel Analysis Dashboard</li>
            <li>Product Performance Dashboard</li>
            <li>Regional Sales Dashboard</li>
            <li>Customer Analysis Dashboard</li>
          </ul>
        </div>
      )
    },
    {
      title: "Update URLs",
      description: "Replace placeholder URLs with your actual dashboard URLs",
      content: (
        <div className="space-y-4">
          <p>Update the URLs in <code>lib/lightdash.ts</code> with your actual:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Dashboard UUIDs</li>
            <li>Chart UUIDs</li>
            <li>Project ID</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lightdash Setup Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{steps[step - 1].title}</h3>
            <p className="text-muted-foreground mb-4">{steps[step - 1].description}</p>
            {steps[step - 1].content}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => setStep(Math.min(steps.length, step + 1))}
              disabled={step === steps.length}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}