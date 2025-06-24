'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Sales API functions
async function fetchSalesSummary() {
  const response = await fetch('/api/sales/summary')
  if (!response.ok) {
    throw new Error('Failed to fetch sales summary')
  }
  return response.json()
}

async function fetchCustomerSales(customerNo: string) {
  const response = await fetch(`/api/sales/${customerNo}`)
  if (!response.ok) {
    throw new Error('Failed to fetch customer sales')
  }
  return response.json()
}

async function fetchSalesAnalytics(filters?: {
  startDate?: string
  endDate?: string
  region?: string
  channel?: string
  segment?: string
  product?: string
}) {
  let url = '/api/analytics'
  
  if (filters) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch sales analytics')
  }
  return response.json()
}

async function fetchSalesMetrics(dateRange?: { from: Date, to: Date }) {
  let url = '/api/sales/metrics'
  
  if (dateRange) {
    const params = new URLSearchParams()
    params.append('startDate', dateRange.from.toISOString().split('T')[0])
    params.append('endDate', dateRange.to.toISOString().split('T')[0])
    url += `?${params.toString()}`
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch sales metrics')
  }
  return response.json()
}

async function fetchSalesTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  const response = await fetch(`/api/sales/trends?period=${period}`)
  if (!response.ok) {
    throw new Error('Failed to fetch sales trends')
  }
  return response.json()
}

async function fetchTopPerformers(type: 'products' | 'customers' | 'regions' = 'products', limit = 10) {
  const response = await fetch(`/api/sales/top-performers?type=${type}&limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch top performers')
  }
  return response.json()
}

// Sales forecasting and predictions
async function fetchSalesForecast(months = 6) {
  const response = await fetch(`/api/sales/forecast?months=${months}`)
  if (!response.ok) {
    throw new Error('Failed to fetch sales forecast')
  }
  return response.json()
}

// Regional and channel breakdown
async function fetchSalesByRegion(dateRange?: { from: Date, to: Date }) {
  let url = '/api/sales/by-region'
  
  if (dateRange) {
    const params = new URLSearchParams()
    params.append('startDate', dateRange.from.toISOString().split('T')[0])
    params.append('endDate', dateRange.to.toISOString().split('T')[0])
    url += `?${params.toString()}`
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch sales by region')
  }
  return response.json()
}

async function fetchSalesByChannel(dateRange?: { from: Date, to: Date }) {
  let url = '/api/sales/by-channel'
  
  if (dateRange) {
    const params = new URLSearchParams()
    params.append('startDate', dateRange.from.toISOString().split('T')[0])
    params.append('endDate', dateRange.to.toISOString().split('T')[0])
    url += `?${params.toString()}`
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch sales by channel')
  }
  return response.json()
}

// Query Hooks
export const useSalesSummary = () => {
  return useQuery({
    queryKey: ['salesSummary'],
    queryFn: fetchSalesSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useCustomerSales = (customerNo: string) => {
  return useQuery({
    queryKey: ['customerSales', customerNo],
    queryFn: () => fetchCustomerSales(customerNo),
    enabled: !!customerNo,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useSalesAnalytics = (filters?: {
  startDate?: string
  endDate?: string
  region?: string
  channel?: string
  segment?: string
  product?: string
}) => {
  return useQuery({
    queryKey: ['salesAnalytics', filters],
    queryFn: () => fetchSalesAnalytics(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  })
}

export const useSalesMetrics = (dateRange?: { from: Date, to: Date }) => {
  return useQuery({
    queryKey: ['salesMetrics', dateRange],
    queryFn: () => fetchSalesMetrics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useSalesTrends = (period: 'daily' | 'weekly' | 'monthly' = 'monthly') => {
  return useQuery({
    queryKey: ['salesTrends', period],
    queryFn: () => fetchSalesTrends(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useTopPerformers = (type: 'products' | 'customers' | 'regions' = 'products', limit = 10) => {
  return useQuery({
    queryKey: ['topPerformers', type, limit],
    queryFn: () => fetchTopPerformers(type, limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

export const useSalesForecast = (months = 6) => {
  return useQuery({
    queryKey: ['salesForecast', months],
    queryFn: () => fetchSalesForecast(months),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export const useSalesByRegion = (dateRange?: { from: Date, to: Date }) => {
  return useQuery({
    queryKey: ['salesByRegion', dateRange],
    queryFn: () => fetchSalesByRegion(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useSalesByChannel = (dateRange?: { from: Date, to: Date }) => {
  return useQuery({
    queryKey: ['salesByChannel', dateRange],
    queryFn: () => fetchSalesByChannel(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Dependent queries for comprehensive sales dashboard
export const useSalesDashboardData = (dateRange?: { from: Date, to: Date }) => {
  const summaryQuery = useSalesSummary()
  const metricsQuery = useSalesMetrics(dateRange)
  const trendsQuery = useSalesTrends('monthly')
  const topProductsQuery = useTopPerformers('products', 5)
  const topCustomersQuery = useTopPerformers('customers', 5)
  const regionQuery = useSalesByRegion(dateRange)
  const channelQuery = useSalesByChannel(dateRange)
  
  return {
    summary: summaryQuery,
    metrics: metricsQuery,
    trends: trendsQuery,
    topProducts: topProductsQuery,
    topCustomers: topCustomersQuery,
    regions: regionQuery,
    channels: channelQuery,
    isLoading: [
      summaryQuery, 
      metricsQuery, 
      trendsQuery, 
      topProductsQuery, 
      topCustomersQuery,
      regionQuery,
      channelQuery
    ].some(q => q.isLoading),
    isError: [
      summaryQuery, 
      metricsQuery, 
      trendsQuery, 
      topProductsQuery, 
      topCustomersQuery,
      regionQuery,
      channelQuery
    ].some(q => q.isError),
  }
}

// Mutation for refreshing sales data
export const useRefreshSalesData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesSummary'] })
      queryClient.invalidateQueries({ queryKey: ['salesAnalytics'] })
      queryClient.invalidateQueries({ queryKey: ['salesMetrics'] })
      queryClient.invalidateQueries({ queryKey: ['salesTrends'] })
      queryClient.invalidateQueries({ queryKey: ['topPerformers'] })
      queryClient.invalidateQueries({ queryKey: ['salesByRegion'] })
      queryClient.invalidateQueries({ queryKey: ['salesByChannel'] })
    }
  })
}