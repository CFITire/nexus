'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'

interface DateRange {
  from?: Date
  to?: Date
}

interface SalesOrderFilters {
  startDate?: string
  endDate?: string
  customerNo?: string
  status?: string
}

interface ShipmentFilters {
  startDate?: string
  endDate?: string
}

// Business Central API functions
async function fetchSalesOrders(filters?: SalesOrderFilters) {
  let url = '/api/business-central/sales-orders'
  if (filters) {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.customerNo) params.append('customerNo', filters.customerNo)
    if (filters.status) params.append('status', filters.status)
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch sales orders')
  }
  return response.json()
}

async function fetchShipments(filters?: ShipmentFilters) {
  let url = '/api/business-central/shipments'
  if (filters) {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch shipments')
  }
  return response.json()
}

async function fetchShipmentAnalytics(dateRange?: DateRange) {
  let url = '/api/business-central/shipment-analytics'
  if (dateRange?.from) {
    const params = new URLSearchParams()
    params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'))
    if (dateRange.to) {
      params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'))
    }
    url += `?${params.toString()}`
  }
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch shipment analytics')
  }
  return response.json()
}

async function fetchPurchaseOrders() {
  const response = await fetch('/api/business-central/purchase-orders')
  if (!response.ok) {
    throw new Error('Failed to fetch purchase orders')
  }
  return response.json()
}

async function fetchLocations() {
  const response = await fetch('/api/business-central/locations')
  if (!response.ok) {
    throw new Error('Failed to fetch locations')
  }
  return response.json()
}

async function fetchSalespersons() {
  const response = await fetch('/api/business-central/salespersons')
  if (!response.ok) {
    throw new Error('Failed to fetch salespersons')
  }
  return response.json()
}

// Query Hooks
export const useSalesOrders = (filters?: SalesOrderFilters, options?: any) => {
  return useQuery({
    queryKey: ['salesOrders', filters],
    queryFn: () => fetchSalesOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  })
}

export const useShipments = (filters?: ShipmentFilters, options?: any) => {
  return useQuery({
    queryKey: ['shipments', filters],
    queryFn: () => fetchShipments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  })
}

export const useShipmentAnalytics = (dateRange?: DateRange, options?: any) => {
  return useQuery({
    queryKey: ['shipmentAnalytics', dateRange],
    queryFn: () => fetchShipmentAnalytics(dateRange),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    ...options,
  })
}

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: fetchPurchaseOrders,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 60 * 60 * 1000, // 1 hour (locations don't change often)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })
}

export const useSalespersons = () => {
  return useQuery({
    queryKey: ['salespersons'],
    queryFn: fetchSalespersons,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })
}

// Mutation hooks for invalidating queries when data changes
export const useRefreshBusinessCentralData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      // This could call a refresh endpoint or just invalidate queries
      return Promise.resolve()
    },
    onSuccess: () => {
      // Invalidate all business central related queries
      queryClient.invalidateQueries({ queryKey: ['salesOrders'] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      queryClient.invalidateQueries({ queryKey: ['shipmentAnalytics'] })
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
    }
  })
}