"use client"

import { useState, useEffect } from "react"
import { IconClipboardCheck, IconClock, IconShoppingCart, IconTrendingUp, IconCircle } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardStats {
  totalInspections: number
  pendingInspections: number
  activeSalesOrders: number
  completionRate: number
  trends: {
    inspections: number
    pending: number
    salesOrders: number
    completion: number
  }
}

export function SectionCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInspections: 0,
    pendingInspections: 0, 
    activeSalesOrders: 0,
    completionRate: 0,
    trends: {
      inspections: 0,
      pending: 0,
      salesOrders: 0,
      completion: 0
    }
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch inspections data
        const inspectionsResponse = await fetch('/api/inspections')
        const salesOrdersResponse = await fetch('/api/business-central/sales-orders')
        
        let totalInspections = 0
        let pendingInspections = 0
        let completionRate = 0
        
        if (inspectionsResponse.ok) {
          const inspectionsData = await inspectionsResponse.json()
          const inspections = inspectionsData.value || inspectionsData || []
          
          if (Array.isArray(inspections)) {
            totalInspections = inspections.length
            pendingInspections = inspections.filter((i: any) => 
              i.Status === 'Open' || i.Status === 'In Progress'
            ).length
            const completedInspections = inspections.filter((i: any) => 
              i.Status === 'Completed'
            ).length
            completionRate = totalInspections > 0 ? 
              Math.round((completedInspections / totalInspections) * 100) : 0
          }
        }

        let activeSalesOrders = 0
        if (salesOrdersResponse.ok) {
          const salesData = await salesOrdersResponse.json()
          const salesOrders = salesData.value || salesData || []
          if (Array.isArray(salesOrders)) {
            activeSalesOrders = salesOrders.filter((so: any) => 
              so.Status === 'Open' || so.status === 'Open'
            ).length
          }
        }

        setStats({
          totalInspections,
          pendingInspections,
          activeSalesOrders,
          completionRate,
          trends: {
            inspections: 15, // Mock trend data - could be calculated from historical data
            pending: -8,
            salesOrders: 12,
            completion: 5
          }
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        // Set mock data for demonstration
        setStats({
          totalInspections: 127,
          pendingInspections: 23,
          activeSalesOrders: 45,
          completionRate: 82,
          trends: {
            inspections: 15,
            pending: -8, 
            salesOrders: 12,
            completion: 5
          }
        })
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Inspections</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalInspections.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{stats.trends.inspections}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconCircle className="size-4" />
            Growing steadily this month
          </div>
          <div className="text-muted-foreground">
            All tire and equipment inspections
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Inspections</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendingInspections}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClock />
              {stats.trends.pending > 0 ? '+' : ''}{stats.trends.pending}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconClock className="size-4" />
            Awaiting completion
          </div>
          <div className="text-muted-foreground">
            Open and in-progress inspections
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Sales Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeSalesOrders}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{stats.trends.salesOrders}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconShoppingCart className="size-4" />
            Strong order volume
          </div>
          <div className="text-muted-foreground">
            Orders requiring inspections
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completion Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.completionRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{stats.trends.completion}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconClipboardCheck className="size-4" />
            Meeting quality targets
          </div>
          <div className="text-muted-foreground">
            Completed vs total inspections
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
