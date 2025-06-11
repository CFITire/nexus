'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShipmentMap } from '@/components/shipment-map'
import { ShipmentAnalytics } from '@/components/shipment-analytics'
import { DateRangePicker } from '@/components/date-range-picker'
import { useRBAC } from '@/hooks/use-rbac'
import { RefreshCw, Map, BarChart3, Lock } from 'lucide-react'
import { format } from 'date-fns'

interface DateRange {
  from?: Date
  to?: Date
}

export function ShipmentsContent() {
  const { hasModuleAccess, loading: isLoading } = useRBAC()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  })
  const [shipments, setShipments] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  // Check if user has access to shipments/analytics
  const hasShipmentAccess = hasModuleAccess('shipments') || hasModuleAccess('analytics') || hasModuleAccess('admin')

  const fetchShipments = async (range?: DateRange) => {
    setLoading(true)
    try {
      let url = '/api/business-central/shipments'
      if (range?.from) {
        const params = new URLSearchParams()
        params.append('startDate', format(range.from, 'yyyy-MM-dd'))
        if (range.to) {
          params.append('endDate', format(range.to, 'yyyy-MM-dd'))
        }
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      console.log('Fetched shipments:', data.value?.length || 0, 'shipments')
      console.log('Sample shipment:', data.value?.[0])
      setShipments(data.value || [])
    } catch (error) {
      console.error('Error fetching shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/business-central/shipment-analytics')
      const data = await response.json()
      setAnalytics(data.value)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    if (hasShipmentAccess) {
      fetchShipments(dateRange)
      fetchAnalytics()
    }
  }, [dateRange, hasShipmentAccess])

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  const handleRefresh = () => {
    if (hasShipmentAccess) {
      fetchShipments(dateRange)
      fetchAnalytics()
    }
  }

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        <div className="m-auto flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  // Show access denied if user doesn't have permission
  if (!hasShipmentAccess) {
    return (
      <div className="flex h-screen w-full">
        <div className="m-auto text-center space-y-4">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to view shipment tracking and analytics.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please contact your administrator to request access to the Analytics module.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shipment Tracking</h1>
          <p className="text-muted-foreground">
            Track deliveries and analyze shipping performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading shipments...
                </div>
              </CardContent>
            </Card>
          ) : (
            <ShipmentMap 
              shipments={shipments} 
              selectedDate={dateRange?.from && dateRange?.to 
                ? { from: dateRange.from, to: dateRange.to }
                : new Date().toISOString().split('T')[0]
              } 
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics ? (
            <ShipmentAnalytics data={analytics} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading analytics...
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}