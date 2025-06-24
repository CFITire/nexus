// Lightdash API integration utilities

interface LightdashConfig {
  baseUrl: string;
  projectId: string;
  apiKey?: string;
}

interface LightdashQueryResult {
  data: any[];
  fields: Record<string, any>;
  metricQuery: any;
}

interface LightdashDashboard {
  uuid: string;
  name: string;
  description?: string;
  updatedAt: string;
  spaceUuid: string;
  tiles: any[];
}

class LightdashClient {
  private config: LightdashConfig;

  constructor(config: LightdashConfig) {
    this.config = config;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.config.baseUrl}/api/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Lightdash API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all dashboards in a project
  async getDashboards(): Promise<LightdashDashboard[]> {
    const response = await this.request(`/projects/${this.config.projectId}/dashboards`);
    return response.results || [];
  }

  // Get a specific dashboard
  async getDashboard(dashboardUuid: string): Promise<LightdashDashboard> {
    const response = await this.request(`/projects/${this.config.projectId}/dashboards/${dashboardUuid}`);
    return response.results;
  }

  // Run a saved chart query
  async runSavedChartQuery(chartUuid: string): Promise<LightdashQueryResult> {
    const response = await this.request(`/saved/${chartUuid}/results`);
    return response.results;
  }

  // Get embedding URLs
  getDashboardEmbedUrl(dashboardUuid: string, filters?: Record<string, any>): string {
    let url = `${this.config.baseUrl}/projects/${this.config.projectId}/dashboards/${dashboardUuid}`;
    
    // Add filters as query parameters
    if (filters && Object.keys(filters).length > 0) {
      const filterParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        filterParams.set(key, String(value));
      });
      url += `?${filterParams.toString()}`;
    }

    return url;
  }

  getChartEmbedUrl(chartUuid: string, filters?: Record<string, any>): string {
    let url = `${this.config.baseUrl}/projects/${this.config.projectId}/saved/${chartUuid}`;
    
    if (filters && Object.keys(filters).length > 0) {
      const filterParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        filterParams.set(key, String(value));
      });
      url += `?${filterParams.toString()}`;
    }

    return url;
  }

  // Get available tables/models
  async getTables(): Promise<any[]> {
    const response = await this.request(`/projects/${this.config.projectId}/tables`);
    return response.results || [];
  }

  // Search for content
  async search(query: string): Promise<any[]> {
    const response = await this.request(`/projects/${this.config.projectId}/search?q=${encodeURIComponent(query)}`);
    return response.results || [];
  }
}

// Configuration - replace with your actual Lightdash instance details
export const lightdashConfig: LightdashConfig = {
  baseUrl: process.env.NEXT_PUBLIC_LIGHTDASH_URL || 'https://your-lightdash-instance.com',
  projectId: process.env.NEXT_PUBLIC_LIGHTDASH_PROJECT_ID || 'your-project-id',
  apiKey: process.env.LIGHTDASH_API_KEY, // Server-side only
};

// Create client instance
export const lightdash = new LightdashClient(lightdashConfig);

// Utility functions for common operations
export const lightdashUtils = {
  // Generate embed URL with current user context/filters
  getSalesOverviewUrl: (filters?: { dateRange?: string; region?: string }) => {
    return lightdash.getDashboardEmbedUrl('your-sales-overview-dashboard-uuid', filters);
  },

  getChannelAnalysisUrl: (filters?: { channel?: string; dateRange?: string }) => {
    return lightdash.getDashboardEmbedUrl('your-channel-analysis-dashboard-uuid', filters);
  },

  getCustomerAnalysisUrl: (customerId?: string) => {
    const filters = customerId ? { customer_id: customerId } : undefined;
    return lightdash.getDashboardEmbedUrl('your-customer-analysis-dashboard-uuid', filters);
  },

  // Chart-specific URLs
  getSalesChartUrl: (chartType: 'overview' | 'channel' | 'product' | 'region') => {
    const chartUuids = {
      overview: 'your-overview-chart-uuid',
      channel: 'your-channel-chart-uuid',
      product: 'your-product-chart-uuid',
      region: 'your-region-chart-uuid'
    };
    return lightdash.getChartEmbedUrl(chartUuids[chartType]);
  }
};

// Hook for using Lightdash data in React components
export function useLightdashData(chartUuid: string) {
  const [data, setData] = useState<LightdashQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await lightdash.runSavedChartQuery(chartUuid);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    if (chartUuid) {
      fetchData();
    }
  }, [chartUuid]);

  return { data, loading, error };
}

// Types for TypeScript
export type { LightdashConfig, LightdashQueryResult, LightdashDashboard };