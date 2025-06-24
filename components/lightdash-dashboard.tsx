'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface LightdashDashboardProps {
  dashboardUrl: string;
  title?: string;
  height?: string;
  allowFullscreen?: boolean;
}

// Individual dashboard component
export function LightdashDashboard({ 
  dashboardUrl, 
  title = "Analytics Dashboard", 
  height = "600px",
  allowFullscreen = true 
}: LightdashDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load dashboard');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openInNewTab = () => {
    window.open(dashboardUrl, '_blank');
  };

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {allowFullscreen && (
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={openInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Skeleton className="w-full h-96" />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center p-8 text-destructive">
            {error}
          </div>
        )}
        <iframe
          src={dashboardUrl}
          width="100%"
          height={isFullscreen ? '80vh' : height}
          frameBorder="0"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className={`${isLoading || error ? 'hidden' : 'block'} rounded-b-lg`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
        />
      </CardContent>
    </Card>
  );
}

// Multi-dashboard component with tabs
export function LightdashDashboardTabs() {
  // Replace these with your actual Lightdash dashboard URLs
  const dashboards = [
    {
      id: 'sales-overview',
      title: 'Sales Overview',
      url: 'https://your-lightdash-instance.com/projects/your-project/dashboards/sales-overview',
      description: 'Overall sales performance and KPIs'
    },
    {
      id: 'sales-by-channel',
      title: 'Sales by Channel',
      url: 'https://your-lightdash-instance.com/projects/your-project/dashboards/sales-by-channel',
      description: 'Channel performance breakdown'
    },
    {
      id: 'sales-by-product',
      title: 'Product Performance',
      url: 'https://your-lightdash-instance.com/projects/your-project/dashboards/product-performance',
      description: 'Product segment analysis'
    },
    {
      id: 'sales-by-region',
      title: 'Regional Sales',
      url: 'https://your-lightdash-instance.com/projects/your-project/dashboards/regional-sales',
      description: 'Geographic sales distribution'
    },
    {
      id: 'customer-analysis',
      title: 'Customer Analysis',
      url: 'https://your-lightdash-instance.com/projects/your-project/dashboards/customer-analysis',
      description: 'Customer segmentation and behavior'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground">
            Powered by Lightdash • Interactive dashboards and insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="sales-overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {dashboards.map((dashboard) => (
            <TabsTrigger key={dashboard.id} value={dashboard.id} className="text-xs">
              {dashboard.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {dashboards.map((dashboard) => (
          <TabsContent key={dashboard.id} value={dashboard.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{dashboard.title}</h3>
                <p className="text-sm text-muted-foreground">{dashboard.description}</p>
              </div>
            </div>
            
            <LightdashDashboard
              dashboardUrl={dashboard.url}
              title={dashboard.title}
              height="70vh"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Component for a single embedded chart/visualization
export function LightdashChart({ 
  chartUrl, 
  title,
  height = "400px" 
}: { 
  chartUrl: string; 
  title: string; 
  height?: string; 
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Skeleton className={`w-full`} style={{ height }} />
          </div>
        )}
        <iframe
          src={chartUrl}
          width="100%"
          height={height}
          frameBorder="0"
          onLoad={() => setIsLoading(false)}
          className={`${isLoading ? 'hidden' : 'block'} rounded-b-lg`}
          sandbox="allow-scripts allow-same-origin"
        />
      </CardContent>
    </Card>
  );
}